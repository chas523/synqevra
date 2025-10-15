import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Medplum } from '../entities/medplum.entity';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dtos/createProjectDto';
import {
  LoginAuthenticationResponse,
  MedplumClient,
  MemoryStorage,
  ClientStorage,
} from '@medplum/core';
import process from 'node:process';
import { CurrentUser } from '../auth/types/current-user';
import { ConnectionService } from '../connection/connection.service';
import { webcrypto } from 'node:crypto';

@Injectable()
export class MedplumService {
  constructor(
    @InjectRepository(Medplum)
    private readonly medplumRepository: Repository<Medplum>,
    private readonly connectionService: ConnectionService,
  ) {}

  private async registerAndGetClientApp(dto: CreateProjectDto) {
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

    console.info('Connection to Medplum');
    const registration = await medplum.startNewUser({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: dto.password,
      recaptchaToken: '',
    });

    console.info('Registration', registration);

    if (registration.code) {
      await medplum.processCode(registration.code);
    }

    // If it fails after this point, something went wrong that should not go wrong

    const projectResponse: LoginAuthenticationResponse =
      await medplum.startNewProject({
        login: registration.login,
        projectName: dto.project,
      });

    console.info('Project', projectResponse);

    if (projectResponse.code) {
      await medplum.processCode(projectResponse.code, {
        redirectUri: medplum.getBaseUrl(),
      });
      console.info('Active login after processCode:', medplum.getActiveLogin());
    }

    const loginState = medplum.getActiveLogin();
    if (!loginState) {
      throw new InternalServerErrorException('Medplum login state is null');
    }
    console.log('Login state', loginState);

    const projectReference = loginState.project?.reference;
    if (!projectReference) {
      throw new InternalServerErrorException('Project reference is null');
    }
    const projectId = projectReference.split('/')[1];

    const search = await medplum.searchResources('ClientApplication', {
      _project: projectId,
    });

    console.log('Search result', search);
    const clientApp = search[0];

    if (!clientApp.secret) {
      throw new InternalServerErrorException(
        'Client application secret is null',
      );
    }

    return { clientId: clientApp.id, clientSecret: clientApp.secret };
  }

  async create(dto: CreateProjectDto, user: CurrentUser) {
    const userId: number = user.id;
    const connection =
      await this.connectionService.getOrCreateUserConnection(userId);
    if (!connection) {
      throw new NotFoundException('User connection not found');
    }

    if (connection.medplum) {
      throw new BadRequestException(
        'Medplum connection already exists for this user',
      );
    }

    const { clientId, clientSecret } = await this.registerAndGetClientApp(dto);

    const medplumEntity = this.medplumRepository.create({
      client_id: clientId,
      client_secret: clientSecret,
      connection: connection,
    });

    return await this.medplumRepository.save(medplumEntity);
  }
}
