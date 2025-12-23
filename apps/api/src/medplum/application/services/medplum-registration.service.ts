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

    try {
      this.logger.log('Connection to Medplum');

      const registration = await medplum.startNewUser({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password: dto.password,
        recaptchaToken: '',
      });
      this.logger.debug('Registration', registration);
      if (registration.code) {
        await medplum.processCode(registration.code);
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

      return {
        clientId: clientApp.id,
        clientSecret: clientApp.secret,
      };
    } catch (error) {
      this.logger.error('Error during Medplum registration:', error);

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
