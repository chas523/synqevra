import { ResourceArray, WithId } from '@medplum/core';
import {
  Practitioner,
  Patient,
  Encounter,
  Device,
  Observation,
} from '@medplum/fhirtypes';
import { MedplumIdentifierCommand } from '../dto/medplum-identifier.command';

export abstract class MedplumClientPort {
  abstract createPatient(
    patient: Patient,
    userId?: number,
    tenantId?: string,
  ): Promise<Patient>;

  abstract createDevice(
    deviceDto: { identifier: string },
    userId?: number,
    tenantId?: string,
  ): Promise<WithId<Device>>;

  abstract updatePatient(
    id: string,
    patient: Patient,
    userId?: number,
    tenantId?: string,
  ): Promise<WithId<Patient>>;

  abstract getPatientList(
    userId?: number,
    tenantId?: string,
  ): Promise<Patient[]>;

  abstract findPatientById(
    id: string,
    userId?: number,
    tenantId?: string,
  ): Promise<WithId<Patient>>;

  abstract findPatientByIdentifier(
    identifier: MedplumIdentifierCommand,
    userId?: number,
    tenantId?: string,
  ): Promise<Patient | null>;

  abstract findPatientObservations(
    id: string,
    count?: number,
    userId?: number,
    tenantId?: string,
  ): Promise<ResourceArray<WithId<Observation>>>;

  abstract findDeviceWithUserId(
    userId: number,
    deviceId: string,
  ): Promise<Device>;

  abstract assignPatientToDevice(
    patientId: string,
    deviceId: string,
    userId?: number,
    tenantId?: string,
  ): Promise<WithId<Device>>;

  abstract findPractitionerById(
    practitionerId: string,
    userId?: number,
    tenantId?: string,
  ): Promise<Practitioner | null>;

  abstract findPractitionerBySurname(
    lastName: string,
    userId?: number,
    tenantId?: string,
  ): Promise<Practitioner | null>;

  abstract findExistingEncounter(
    tenantId: string,
    encounter: Partial<Encounter>,
  ): Promise<Encounter | null>;
}
