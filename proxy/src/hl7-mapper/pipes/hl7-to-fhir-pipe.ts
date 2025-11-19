import { PipeTransform, Injectable, Logger, Inject } from '@nestjs/common';
import { Hl7Message } from '@medplum/core';
import { Hl7MessageDto } from '../dto/hl7-message.dto';
import { FhirMappedResourcesDto } from '../dto/fhir-mapped-resources.dto';
import { getMessageType } from '../utils/hl7-mapping.utils';
import { MedplumService } from '../../medplum/medplum.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CACHE_CONFIG } from '../constants/cache.constants';
import {
  createPatientFromPID,
  prepareMergeData,
  findPatientOptimized,
  mergePatientData,
} from '../utils/segmentUtils/createPatientFromPID.utils';
import { createEncounterFromPV1 } from '../utils/segmentUtils/createEncounterFromPV1.utils';

export class Hl7ParsingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Hl7ParsingError';
  }
}

@Injectable()
export class HL7ToFHIRPipe
  implements PipeTransform<Hl7MessageDto, Promise<FhirMappedResourcesDto>>
{
  private readonly logger = new Logger(HL7ToFHIRPipe.name);
  private readonly ORGANIZATION_ID = 'orgid';
  private readonly ORGANIZATION_NAME = 'organization name';
  private readonly ORGANIZATION_SYSTEM = 'org-system';

  constructor(
    private readonly medplumService: MedplumService,
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
        const mergeData = await prepareMergeData(hl7Message, {
          id: this.ORGANIZATION_ID,
          name: this.ORGANIZATION_NAME,
          system: this.ORGANIZATION_SYSTEM,
        });
        return new FhirMappedResourcesDto({
          tenantId,
          messageType,
          rawMessage,
          mergeOperation: mergeData,
          alreadyProcessed: false,
        });
      }

      const newPatient = createPatientFromPID(hl7Message, {
        id: this.ORGANIZATION_ID,
        name: this.ORGANIZATION_NAME,
        system: this.ORGANIZATION_SYSTEM,
      });
      this.logger.log('Created patient from PID segment');
      this.logger.debug('Patient data:', newPatient);

      this.logger.log('Searching for existing patient in Medplum...');
      const existingPatient = await findPatientOptimized(
        tenantId,
        newPatient,
        this.medplumService,
      );

      if (existingPatient) {
        this.logger.log(`Found existing patient: ${existingPatient.id}`);
      } else {
        this.logger.log('Patient not found - will be created as new');
      }

      const patient = existingPatient
        ? mergePatientData(existingPatient, newPatient)
        : newPatient;

      this.logger.log('Processing PV1 segment for encounter creation');
      const encounterResult = await createEncounterFromPV1(
        hl7Message,
        messageType,
        tenantId,
        patient,
        this.cacheManager,
        this.medplumService,
        {
          id: this.ORGANIZATION_ID,
          name: this.ORGANIZATION_NAME,
          system: this.ORGANIZATION_SYSTEM,
        },
      );

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
