import { Injectable, Logger } from '@nestjs/common';
import { PidToPatientMapper } from '../../infrastructure/mappers/pid-to-patient.mapper';
import { MedplumClientPort } from '../../../medplum/application/ports/medplum-client.port';
import {
  CreateOrMergePatientResult,
  CreatePatientFromPidCommand,
} from '../dto/create-patient-from-pid.command';
import { Patient } from '@medplum/fhirtypes';

@Injectable()
export class CreatePatientFromPidUseCase {
  constructor(
    private readonly mapper: PidToPatientMapper,
    private readonly medplum: MedplumClientPort,
  ) {}

  private readonly logger = new Logger(CreatePatientFromPidUseCase.name);

  async execute(
    command: CreatePatientFromPidCommand,
  ): Promise<CreateOrMergePatientResult> {
    const patientDraft = this.mapper.map(
      command.message,
      command.organizationConfig,
    );

    const existingPatient = await this.findExistingPatient(
      command.tenantId,
      patientDraft,
    );

    if (existingPatient) {
      this.logger.log(`Found existing patient: ${existingPatient.id}`);
      const merged = this.mapper.mergePatientData(
        existingPatient,
        patientDraft,
      );
      return { patient: merged };
    }
    this.logger.log('Patient not found - will be created as new');

    return { patient: patientDraft };
  }

  executeMerge(
    command: CreatePatientFromPidCommand,
  ): CreateOrMergePatientResult {
    const mergeData = this.mapper.mapMergeData(
      command.message,
      command.organizationConfig,
    );

    return {
      patient: mergeData.newPatient,
      mergeFromIdentifier: mergeData.oldPatientIdentifier,
    };
  }

  private async findExistingPatient(
    tenantId: string,
    patient: Partial<Patient>,
  ) {
    if (!patient.identifier || patient.identifier.length === 0) return null;

    const primaryIdentifier = patient.identifier[0];
    if (!primaryIdentifier.system || !primaryIdentifier.value) return null;

    try {
      this.logger.log(
        `Searching patient with primary identifier: ${primaryIdentifier.system}|${primaryIdentifier.value}`,
      );

      return await this.medplum.findPatientByIdentifier(
        {
          system: primaryIdentifier.system,
          value: primaryIdentifier.value,
        },
        undefined,
        tenantId,
      );
    } catch (error) {
      this.logger.error('Error in optimized patient search:', error);
      return null;
    }
  }
}
