import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
  Inject,
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
import { ConnectionService } from '../connection/connection.service';
import { webcrypto } from 'node:crypto';
import { Device } from '@medplum/fhirtypes';
import { MedplumConnectionService } from '../connection/medplum-connection.service';

@Injectable()
export class MedplumService {
  constructor(
    @InjectRepository(Medplum)
    private readonly medplumRepository: Repository<Medplum>,

    @Inject(forwardRef(() => ConnectionService))
    private readonly connectionService: ConnectionService,

    private readonly medplum: MedplumConnectionService,
  ) {}

  /**
    here, the rollback mechanism is not needed. the only way for the function to throw an error
    is *const registration = await medplum.startNewUser({* after specifying used Email, or password that
    exists in breach database. so if the error appears, we haven't created anything yet. so there's nothing to rollback
    if there's no error there, then there will be no error at all
    this gets used in 'connectionService.buildInitialConnection'. it's needed to call this function
    at the very end of buildInitialConnection function - if something goes wrong BEFORE we call this function there
    then we don't have anything to rollback here. if something goes wrong in our function - then that's explained above.
 */
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

    try {
      console.log('Connection to Medplum');
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
        console.log(
          'Active login after processCode:',
          medplum.getActiveLogin(),
        );
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
    } catch (error) {
      console.error('Error during Medplum registration:', error);

      if (
        error instanceof Error &&
        error.message &&
        error.message.includes('Email already registered')
      ) {
        throw new BadRequestException('Email already registered');
      }
      if (
        error instanceof Error &&
        error.message &&
        error.message.includes('Password found in breach database (password)')
      ) {
        throw new BadRequestException('Password found in breach database');
      }
      if (
        error instanceof Error &&
        error.message &&
        error.message.includes('Password must be between 8 and 72 characters')
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

  async create(
    dto: CreateProjectDto,
    userId: number,
    medplumRepo?: Repository<Medplum>,
    connectionRepo?: Repository<any>,
  ) {
    const connection = await this.connectionService.getOrCreateUserConnection(
      userId,
      connectionRepo,
    );
    if (!connection) {
      throw new NotFoundException('User connection not found');
    }

    if (connection.medplum) {
      throw new BadRequestException(
        'Medplum connection already exists for this user',
      );
    }

    const { clientId, clientSecret } = await this.registerAndGetClientApp(dto);

    const medplumRepository = medplumRepo || this.medplumRepository;
    const medplumEntity = medplumRepository.create({
      client_id: clientId,
      client_secret: clientSecret,
      connection: connection,
    });

    return await medplumRepository.save(medplumEntity);
  }
  async createDevice(deviceDto: { identifier: string }, userId: number) {
    const medplum: MedplumClient = await this.medplum.initMedplum(userId);

    const device: Device = {
      resourceType: 'Device',
      id: deviceDto.identifier,
      identifier: [
        {
          system: 'http://localhost:8088/entities/devices/',
          value: deviceDto.identifier,
        },
      ],
    };

    try {
      const created = await medplum.createResource(device);
      return created;
    } catch (error: any) {
      if (error?.status === 400) {
        throw new BadRequestException(error.message || 'Bad Request');
      }
      if (error?.status === 401) {
        throw new BadRequestException('Unauthorized');
      }
      throw new InternalServerErrorException(
        error.message || 'Internal Server Error',
      );
    }
  }

  async getPatientList(userId: number) {
    const medplum: MedplumClient = await this.medplum.initMedplum(userId);
    const patients = await medplum.searchResources('Patient');

    return patients;
  }
  async assignPatientToDevice(
    patientId: string,
    deviceId: string,
    userId: number,
  ) {
    const client: MedplumClient = await this.medplum.initMedplum(userId);

    const device = await this.getDevice(deviceId, client);

    const patient = await client.readResource('Patient', patientId);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const deviceWithPatient: Device = {
      ...device,
      patient: {
        reference: `Patient/${patient.id}`,
        display:
          patient.name && patient.name[0]
            ? `${patient.name[0].given?.join(' ') ?? ''} ${patient.name[0].family ?? ''}`.trim()
            : '',
      },
    };

    try {
      const updatedDevice = await client.updateResource(deviceWithPatient);
      return updatedDevice;
    } catch (error: any) {
      if (error?.status === 400) {
        throw new BadRequestException(error.message || 'Bad Request');
      }
      if (error?.status === 401) {
        throw new BadRequestException('Unauthorized');
      }
      throw new InternalServerErrorException(
        error.message || 'Internal Server Error',
      );
    }
  }

  async getDevice(deviceId: string, client: MedplumClient) {
    const tbUrl = process.env.TB_URL as string;

    const device = (await client.searchOne('Device', {
      identifier: `${tbUrl}|${deviceId}`,
    })) as Device | null;

    if (!device) {
      throw new NotFoundException('Device not found');
    }
    return device;
  }
}
