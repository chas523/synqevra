import { PipeTransform, Injectable, Logger, Inject } from '@nestjs/common';
import { Hl7Message } from '@medplum/core';
import { Hl7MessageDto } from '../../application/dto/hl7-message.dto';
import { FhirMappedResourcesDto } from '../../application/dto/fhir-mapped-resources.dto';
import { getMessageType } from '../../infrastructure/utils/hl7-mapping.utils';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CACHE_CONFIG } from '../../infrastructure/constants/cache.constants';
import { CreateEncounterPv1UseCase } from '../../application/use-cases/create-encounter-pv1.use-case';
import { EncounterFromPv1Command } from '../../application/dto/encounter-from-pv1.command';
import { CreatePatientFromPidUseCase } from '../../application/use-cases/create-patient-pid.use-case';

export class Hl7ParsingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Hl7ParsingError';
  }
}

@Injectable()
export class HL7ToFHIRPipe implements PipeTransform<
  Hl7MessageDto,
  Promise<FhirMappedResourcesDto>
> {
  private readonly logger = new Logger(HL7ToFHIRPipe.name);
  private readonly ORGANIZATION_ID = 'orgid';
  private readonly ORGANIZATION_NAME = 'organization name';
  private readonly ORGANIZATION_SYSTEM = 'org-system';

  constructor(
    private readonly createEncounterPV1UseCase: CreateEncounterPv1UseCase,
    private readonly createPatientPIDUseCase: CreatePatientFromPidUseCase,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async transform(value: Hl7MessageDto): Promise<FhirMappedResourcesDto> {
    const { rawMessage, tenantId } = value;

    try {
      const hl7Message = Hl7Message.parse(rawMessage);
      const messageType = getMessageType(hl7Message);
      this.logger.log(`Processing message type: ${messageType}`);

      const alreadyProcessed = await this.wasAlreadyProcessed(hl7Message);
      if (alreadyProcessed) {
        return new FhirMappedResourcesDto({
          tenantId,
          messageType,
          rawMessage,
          alreadyProcessed: true,
        });
      }

      if (messageType === 'A40') {
        this.logger.log('Processing patient merge (A40)');

        const mergeData = this.createPatientPIDUseCase.executeMerge({
          message: hl7Message,
          tenantId,
          organizationConfig: {
            id: this.ORGANIZATION_ID,
            name: this.ORGANIZATION_NAME,
            system: this.ORGANIZATION_SYSTEM,
          },
        });

        return new FhirMappedResourcesDto({
          tenantId,
          messageType,
          rawMessage,
          mergeOperation: {
            newPatient: mergeData.patient,
            oldPatientIdentifier: mergeData.mergeFromIdentifier!,
          },
          alreadyProcessed: false,
        });
      }

      const patientResult = await this.createPatientPIDUseCase.execute({
        message: hl7Message,
        tenantId,
        organizationConfig: {
          id: this.ORGANIZATION_ID,
          name: this.ORGANIZATION_NAME,
          system: this.ORGANIZATION_SYSTEM,
        },
      });

      const patient = patientResult.patient;
      if (patient.id) {
        this.logger.log(`Found existing patient: ${patient.id}`);
      } else {
        this.logger.log('Existing patient not found; using draft for creation');
      }

      this.logger.log('Processing PV1 segment for encounter creation');

      const encounterCommand: EncounterFromPv1Command = {
        message: hl7Message,
        messageType,
        tenantId,
        patient,
        organizationConfig: {
          id: this.ORGANIZATION_ID,
          name: this.ORGANIZATION_NAME,
          system: this.ORGANIZATION_SYSTEM,
        },
      };
      const encounterResult =
        await this.createEncounterPV1UseCase.execute(encounterCommand);

      if (
        encounterResult.encounter?.resourceType === 'Encounter' &&
        encounterResult.encounter?.status
      ) {
        this.logger.log('Successfully created encounter from PV1 segment');
      } else {
        this.logger.log(
          'No encounter created - PV1 segment missing or incomplete',
        );
      }

      const result = new FhirMappedResourcesDto({
        tenantId,
        messageType,
        rawMessage,
        patient,
        encounter:
          encounterResult.encounter?.resourceType === 'Encounter' &&
          encounterResult.encounter?.status
            ? encounterResult.encounter
            : undefined,
        practitionersToCreate: encounterResult.practitionersToCreate,
        alreadyProcessed: false,
      });

      this.logger.log('Successfully mapped HL7 message to FHIR resources');

      return result;
    } catch (error) {
      throw new Hl7ParsingError(
        error instanceof Error ? error.message : 'HL7 parsing failed',
      );
    }
  }

  private async wasAlreadyProcessed(hl7Message?: Hl7Message): Promise<boolean> {
    if (!hl7Message) return false;
    const controlId = hl7Message.getSegment('MSH')?.getField(10)?.toString();
    if (!controlId) return false;

    this.logger.log('Checking cache for control ID:', controlId);
    const cacheKey = `${CACHE_CONFIG.KEYS.PROCESSED_MESSAGE_PREFIX}${controlId}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      this.logger.warn(`Skipping already processed message ${controlId}`);
      return true;
    }

    await this.cacheManager.set(cacheKey, true, CACHE_CONFIG.TTL.MESSAGE_CACHE);
    this.logger.log('Marked message as processed in cache:', controlId);
    return false;
  }
}
