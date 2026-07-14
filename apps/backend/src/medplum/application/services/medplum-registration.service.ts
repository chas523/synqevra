import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateProjectDto } from '../../interface/rest/dto/createProjectDto';
import {
  ClientStorage,
  LoginAuthenticationResponse,
  MedplumClient,
  MemoryStorage,
} from '@medplum/core';
import { webcrypto } from 'node:crypto';
import process from 'node:process';

@Injectable()
export class MedplumRegistrationService {
  private readonly logger = new Logger(MedplumRegistrationService.name);

  private extractResourceId(
    reference: string | undefined,
    expectedType: string,
  ): string | null {
    if (!reference) {
      return null;
    }

    const [resourceType, resourceId] = reference.split('/');
    if (resourceType !== expectedType || !resourceId) {
      return null;
    }

    return resourceId;
  }

  private async rollbackCreatedUser(
    medplum: MedplumClient,
    userId: string,
  ): Promise<void> {
    try {
      const memberships = await medplum.searchResources('ProjectMembership', {
        user: `User/${userId}`,
      });

      for (const membership of memberships) {
        if (!membership.id) {
          continue;
        }

        try {
          await medplum.deleteResource('ProjectMembership', membership.id);
        } catch (membershipDeleteError) {
          this.logger.warn(
            `Failed to delete ProjectMembership ${membership.id} during rollback: ${membershipDeleteError instanceof Error ? membershipDeleteError.message : String(membershipDeleteError)}`,
          );
        }
      }

      await medplum.deleteResource('User', userId);
      this.logger.warn(`Rolled back Medplum User/${userId}`);
    } catch (rollbackError) {
      this.logger.error(
        `Failed to rollback Medplum User/${userId}: ${rollbackError instanceof Error ? rollbackError.message : String(rollbackError)}`,
      );
    }
  }

  async registerAndGetClientApp(
    dto: CreateProjectDto,
  ): Promise<{ clientId: string; clientSecret: string }> {
    // Polyfills for Node.js environment
    if (typeof globalThis.crypto === 'undefined') {
      globalThis.crypto = webcrypto as any;
    }
    if (typeof globalThis.window === 'undefined') {
      globalThis.window = {
        btoa: (str: string) => Buffer.from(str, 'binary').toString('base64'),
        atob: (str: string) => Buffer.from(str, 'base64').toString('binary'),
        TextDecoder,
        TextEncoder,
      } as any;
    }
    if (typeof globalThis.sessionStorage === 'undefined') {
      globalThis.sessionStorage = new MemoryStorage();
    }

    const storage = new ClientStorage(new MemoryStorage());
    const medplum = new MedplumClient({
      baseUrl: process.env.MEDPLUM_URL ?? 'http://host.docker.internal:8103',
      storage,
    });

    let createdUserId: string | null = null;
    let userCreated = false;

    try {
      this.logger.log('Connection to Medplum');

      const registration = await medplum.startNewUser({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password: dto.password,
        recaptchaToken: '',
      });
      userCreated = true;
      this.logger.debug('Registration', registration);
      if (registration.code) {
        await medplum.processCode(registration.code);

        const registrationLogin = medplum.getActiveLogin();
        createdUserId = this.extractResourceId(
          registrationLogin?.profile?.reference,
          'User',
        );
      }

      const projectResponse: LoginAuthenticationResponse =
        await medplum.startNewProject({
          login: registration.login,
          projectName: dto.project,
        });

      this.logger.debug('Project response: ' + JSON.stringify(projectResponse));

      if (projectResponse.code) {
        await medplum.processCode(projectResponse.code, {
          redirectUri: medplum.getBaseUrl(),
        });
        this.logger.debug(
          'Active login after processCode:',
          medplum.getActiveLogin(),
        );
      }

      const loginState = medplum.getActiveLogin();
      if (!loginState) {
        throw new InternalServerErrorException('Medplum login state is null');
      }
      this.logger.debug('Login state: ' + JSON.stringify(loginState));

      const projectReference = loginState.project?.reference;
      if (!projectReference) {
        throw new InternalServerErrorException('Project reference is null');
      }

      const projectId = projectReference.split('/')[1];
      const search = await medplum.searchResources('ClientApplication', {
        _project: projectId,
      });

      const clientApp = search[0];
      if (!clientApp?.secret) {
        throw new InternalServerErrorException(
          'Client application secret is null',
        );
      }

      this.logger.log('Finding membership for client application');
      const memberships = await medplum.searchResources('ProjectMembership', {
        _project: projectId,
        user: `ClientApplication/${clientApp.id}`,
      });

      if (memberships.length === 0) {
        throw new InternalServerErrorException(
          'No membership found for client application',
        );
      }

      const membership = memberships[0];
      this.logger.log('Found membership:', membership.id);

      // Update membership to set admin to true
      this.logger.log('Updating membership with admin privileges');
      await medplum.updateResource({
        ...membership,
        admin: true,
      });
      this.logger.log('Membership updated with admin privileges');

      return {
        clientId: clientApp.id,
        clientSecret: clientApp.secret,
      };
    } catch (error) {
      this.logger.error('Error during Medplum registration:', error);

      if (userCreated && createdUserId) {
        await this.rollbackCreatedUser(medplum, createdUserId);
      }

      if (
        error instanceof Error &&
        error.message?.includes('Email already registered')
      ) {
        throw new BadRequestException('Email already registered');
      }
      if (
        error instanceof Error &&
        error.message?.includes('Password found in breach database (password)')
      ) {
        throw new BadRequestException('Password found in breach database');
      }
      if (
        error instanceof Error &&
        error.message?.includes('Password must be between 8 and 72 characters')
      ) {
        throw new BadRequestException(
          'Password must be between 8 and 72 characters',
        );
      }

      throw new InternalServerErrorException(
        'Failed to register user or create project',
      );
    }
  }
}
