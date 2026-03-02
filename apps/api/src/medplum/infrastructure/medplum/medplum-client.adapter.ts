import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MedplumClientPort } from '../../application/ports/medplum-client.port';
import { MedplumClient, ResourceArray, WithId } from '@medplum/core';
import {
  Device,
  Encounter,
  Observation,
  Patient,
  Practitioner,
} from '@medplum/fhirtypes';
import { MedplumIdentifierCommand } from 'src/medplum/application/dto/medplum-identifier.command';
import { MedplumClientFactory } from '../../application/medplum-client.factory';
import { getErrorMessage } from '../../../utils/error.utils';
import process from 'node:process';

@Injectable()
export class MedplumClientAdapter extends MedplumClientPort {
  constructor(private readonly medplumClient: MedplumClientFactory) {
    super();
  }

  private readonly logger = new Logger(MedplumClientAdapter.name);

  async createPatient(
    patient: Patient,
    userId?: number,
    tenantId?: string,
  ): Promise<Patient> {
    const client = await this.medplumClient.initMedplum(userId, tenantId);
    try {
      return await client.createResource(patient);
    } catch (error: unknown) {
      this.handleHttpError(error);
    }
  }

  async updatePatient(
    id: string,
    patient: Patient,
    userId?: number,
    tenantId?: string,
  ): Promise<WithId<Patient>> {
    const client = await this.medplumClient.initMedplum(userId, tenantId);
    const patientResource = await client.readResource('Patient', id);
    if (!patientResource) {
      throw new NotFoundException('Patient not found');
    }

    return await client.updateResource(patient);
  }

  async getPatientList(userId?: number, tenantId?: string): Promise<Patient[]> {
    const client = await this.medplumClient.initMedplum(userId, tenantId);
    const patients = await client.searchResources('Patient');

    return patients;
  }

  async findPatientById(
    id: string,
    userId?: number,
    tenantId?: string,
  ): Promise<WithId<Patient>> {
    const client = await this.medplumClient.initMedplum(userId, tenantId);
    const patient = await client.readResource('Patient', id);
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }

  async findPatientProfileByEmailWithClientIdClientSecret(
    email: string,
    clientId: string,
    clientSecret: string,
  ): Promise<Patient | null> {
    const client = await this.medplumClient.initMedplumWithClientIdClientSecret(
      clientId,
      clientSecret,
    );
    const patient = await client.searchOne('Patient', `email=${email}`);

    return patient || null;
  }

  async findPatientByIdentifier(
    identifier: MedplumIdentifierCommand,
    userId?: number,
    tenantId?: string,
  ): Promise<Patient | null> {
    const client = await this.medplumClient.initMedplum(userId, tenantId);
    const query = `identifier=${identifier.system}|${identifier.value}`;
    const patient = await client.searchOne('Patient', query);

    return patient || null;
  }

  async findPatientObservations(
    id: string,
    count: number = 20,
    userId?: number,
    tenantId?: string,
  ): Promise<ResourceArray<WithId<Observation>>> {
    const client = await this.medplumClient.initMedplum(userId, tenantId);
    const observations = await client.searchResources('Observation', {
      _count: count,
      _sort: '-_lastUpdated',
      _total: 'accurate',
      subject: `Patient/${id}`,
    });

    return observations;
  }

  async createDevice(
    deviceDto: { identifier: string },
    userId?: number,
    tenantId?: string,
  ): Promise<WithId<Device>> {
    const client = await this.medplumClient.initMedplum(userId, tenantId);
    const device: Device = {
      resourceType: 'Device',
      id: deviceDto.identifier,
      identifier: [
        {
          system: process.env.TB_URL as string,
          value: deviceDto.identifier,
        },
      ],
    };
    this.logger.debug(JSON.stringify(device.identifier));
    try {
      return await client.createResource(device);
    } catch (error: unknown) {
      this.logger.error(error);
      this.handleHttpError(error);
    }
  }

  async findDeviceWithUserId(
    userId: number,
    deviceId: string,
  ): Promise<Device> {
    const client = await this.medplumClient.initMedplum(userId);
    return this.findDevice(deviceId, client);
  }

  async assignPatientToDevice(
    patientId: string,
    deviceId: string,
    userId?: number,
    tenantId?: string,
  ): Promise<WithId<Device>> {
    const client = await this.medplumClient.initMedplum(userId, tenantId);
    const device = await this.findDevice(deviceId, client);
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
      return await client.updateResource(deviceWithPatient);
    } catch (error: unknown) {
      this.handleHttpError(error);
    }
  }

  async findPractitionerById(
    practitionerId: string,
    userId?: number,
    tenantId?: string,
  ): Promise<Practitioner | null> {
    const client = await this.medplumClient.initMedplum(userId, tenantId);
    const practitioner = await client.searchOne(
      'Practitioner',
      `identifier=${practitionerId}`,
    );

    return practitioner || null;
  }

  async findPractitionerBySurname(
    lastName: string,
    userId?: number,
    tenantId?: string,
  ): Promise<Practitioner | null> {
    const client = await this.medplumClient.initMedplum(userId, tenantId);
    const practitioner = await client.searchOne(
      'Practitioner',
      `name=${lastName}`,
    );

    return practitioner || null;
  }

  async findExistingEncounter(
    tenantId: string,
    encounter: Partial<Encounter>,
  ): Promise<Encounter | null> {
    if (!encounter.identifier || encounter.identifier.length === 0) {
      return null;
    }

    const identifier = encounter.identifier[0];
    if (!identifier.system || !identifier.value) {
      return null;
    }

    try {
      this.logger.log(
        `Searching encounter with identifier: ${identifier.system}|${identifier.value}`,
      );

      return await this.findEncounterByIdentifier(
        {
          system: identifier.system,
          value: identifier.value,
        },
        undefined,
        tenantId,
      );
    } catch (error) {
      this.logger.error('Error searching for encounter:', error);
      return null;
    }
  }

  private async findEncounterByIdentifier(
    identifier: MedplumIdentifierCommand,
    userId?: number,
    tenantId?: string,
  ): Promise<Encounter | null> {
    const client = await this.medplumClient.initMedplum(userId, tenantId);
    const query = `identifier=${identifier.system}|${identifier.value}`;
    const encounter = await client.searchOne('Encounter', query);

    return encounter || null;
  }

  private async findDevice(
    deviceId: string,
    client: MedplumClient,
  ): Promise<Device> {
    const tbUrl = process.env.TB_URL as string;
    const device = (await client.searchOne('Device', {
      identifier: `${tbUrl}|${deviceId}`,
    })) as Device | null;
    if (!device) {
      this.logger.warn('Device not found:', deviceId, tbUrl);
      throw new NotFoundException('Device not found');
    }

    return device;
  }

  private handleHttpError(err: unknown): never {
    const error =
      typeof err === 'object' && err !== null
        ? (err as { status?: number; message?: string })
        : { status: undefined, message: undefined };

    if (error.status === 400) {
      throw new BadRequestException(getErrorMessage(error) || 'Bad Request');
    }
    if (error.status === 401) {
      throw new BadRequestException('Unauthorized');
    }

    throw new InternalServerErrorException(
      error.message || 'Internal Server Error',
    );
  }
}
