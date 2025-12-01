import { Injectable, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Hl7Message } from '@medplum/core';
import type { MedplumClient } from '@medplum/core';
import { Patient, Encounter, Practitioner } from '@medplum/fhirtypes';
import { QUEUE_NAMES } from '../constants/queue.constants';
import { FhirResourcesJobData } from '../../hl7-mapper/types/hl7-mapper.types';
import { Hl7ProcessingResultDto } from '../../hl7-mapper/dto/hl7-processing-result.dto';
import { MedplumConnectionService } from '../../connection/medplum-connection.service';
import {
  buildAck,
  buildFallbackHl7Message,
  determineErrorDetails,
} from '../../hl7-mapper/utils/hl7-ack.utils';

@Injectable()
@Processor(QUEUE_NAMES.HL7_PROCESSING)
export class FhirToMedplumSaveQueue extends WorkerHost {
  private readonly logger = new Logger(FhirToMedplumSaveQueue.name);

  constructor(private readonly medplumConnection: MedplumConnectionService) {
    super();
  }

  async process(
    job: Job<FhirResourcesJobData, Hl7ProcessingResultDto, string>,
  ): Promise<Hl7ProcessingResultDto> {
    const { mappedResources } = job.data;
    const {
      rawMessage,
      tenantId,
      patient,
      encounter,
      practitionersToCreate,
      mergeOperation,
    } = mappedResources;

    this.logger.log(`Processing job ${job.id} for tenant ${tenantId}`);

    try {
      const hl7Message = Hl7Message.parse(rawMessage);

      const client: MedplumClient =
        await this.medplumConnection.initMedplumWithProjectId(tenantId);
      this.logger.log('Medplum client initialized');

      if (mergeOperation) {
        this.logger.log('Processing A40 patient merge operation');
        await this.handlePatientMerge(client, mergeOperation);

        const ackString = buildAck(hl7Message, 'AA');
        return new Hl7ProcessingResultDto({
          success: true,
          ackCode: 'AA',
          ackMessage: ackString,
        });
      }

      const practitionerIdMap = new Map<string, string>();
      if (practitionersToCreate && practitionersToCreate.length > 0) {
        this.logger.log(
          `Creating ${practitionersToCreate.length} practitioner(s)`,
        );

        for (const practitionerData of practitionersToCreate) {
          const createdPractitioner = await client.createResource(
            practitionerData as Practitioner,
          );
          this.logger.log(`Created practitioner: ${createdPractitioner.id}`);

          if (practitionerData.identifier && practitionerData.identifier[0]) {
            const identifierValue = practitionerData.identifier[0].value;
            if (identifierValue) {
              practitionerIdMap.set(identifierValue, createdPractitioner.id);
            }
          }
        }
      }

      let savedPatient: Patient | null = null;
      if (patient) {
        if (patient.id) {
          this.logger.log(`Updating patient: ${patient.id}`);
          savedPatient = await client.updateResource(patient as Patient);
          this.logger.log(`Updated patient: ${savedPatient.id}`);
        } else {
          this.logger.log('Creating new patient');
          savedPatient = await client.createResource(patient as Patient);
          this.logger.log(`Created patient: ${savedPatient.id}`);
        }
      }

      if (encounter && savedPatient) {
        if (!encounter.subject?.reference && patient && !patient.id) {
          encounter.subject = {
            reference: `Patient/${savedPatient.id}`,
          };
        }

        if (encounter.participant && practitionerIdMap.size > 0) {
          for (const participant of encounter.participant) {
            if (participant.individual?.reference) {
              const refMatch =
                participant.individual.reference.match(/^Practitioner\/(.+)$/);
              if (refMatch) {
                const practitionerId = refMatch[1];
                const newId = practitionerIdMap.get(practitionerId);
                if (newId) {
                  participant.individual.reference = `Practitioner/${newId}`;
                  this.logger.log(
                    `Updated practitioner reference from ${practitionerId} to ${newId}`,
                  );
                }
              }
            }
          }
        }

        if (encounter.id) {
          this.logger.log(`Updating encounter: ${encounter.id}`);
          await client.updateResource(encounter as Encounter);
          this.logger.log(`Updated encounter: ${encounter.id}`);
        } else {
          this.logger.log('Creating new encounter');
          const createdEncounter = await client.createResource(
            encounter as Encounter,
          );
          this.logger.log(`Created encounter: ${createdEncounter.id}`);
        }
      }

      this.logger.log('Successfully persisted all FHIR resources');
      const ackString = buildAck(hl7Message, 'AA');

      return new Hl7ProcessingResultDto({
        success: true,
        ackCode: 'AA',
        ackMessage: ackString,
      });
    } catch (error) {
      this.logger.error('FHIR persistence failed:', error);

      const processedError =
        error instanceof Error ? error : new Error('Unknown error occurred');
      const { ackCode, errorDetails } = determineErrorDetails(processedError);

      const fallbackMessage = buildFallbackHl7Message(rawMessage);
      const ackString = buildAck(fallbackMessage, ackCode, errorDetails);

      return new Hl7ProcessingResultDto({
        success: false,
        ackCode,
        ackMessage: ackString,
        error: processedError.message,
      });
    }
  }

  private async handlePatientMerge(
    client: MedplumClient,
    mergeOperation: {
      newPatient: Patient | Partial<Patient>;
      oldPatientIdentifier: string;
    },
  ): Promise<void> {
    const { newPatient, oldPatientIdentifier } = mergeOperation;

    this.logger.log(
      `Merging patients - old: ${oldPatientIdentifier}, new: ${newPatient.identifier?.[0]?.value}`,
    );

    const newPatientRecord = await client.searchOne(
      'Patient',
      `identifier=${newPatient.identifier?.[0]?.value}`,
    );
    const oldPatientRecord = await client.searchOne(
      'Patient',
      `identifier=${oldPatientIdentifier}`,
    );

    if (!newPatientRecord || !oldPatientRecord) {
      this.logger.warn('One or both patients not found for merge operation');
      return;
    }

    this.logger.log(
      `Found patients for merge: new=${newPatientRecord.id}, old=${oldPatientRecord.id}`,
    );

    const encounters = await client.search(
      'Encounter',
      `subject=Patient/${oldPatientRecord.id}`,
    );

    for (const entry of encounters.entry || []) {
      const encounter = entry.resource as Encounter;
      await client.updateResource({
        ...encounter,
        subject: {
          reference: `Patient/${newPatientRecord.id}`,
        },
      });
    }

    this.logger.log(
      `Reassigned ${encounters.entry?.length || 0} encounters to new patient`,
    );

    const existingIdentifiers = newPatientRecord.identifier || [];
    const oldIdentifiers = oldPatientRecord.identifier || [];

    const mergedIdentifiers = [...existingIdentifiers];
    for (const oldId of oldIdentifiers) {
      const exists = mergedIdentifiers.some(
        (existing) =>
          existing.system === oldId.system && existing.value === oldId.value,
      );
      if (!exists) {
        mergedIdentifiers.push(oldId);
      }
    }

    const updatedPatient: Patient = {
      ...newPatientRecord,
      identifier: mergedIdentifiers,
      link: [
        ...(newPatientRecord.link || []),
        {
          other: {
            reference: `Patient/${oldPatientRecord.id}`,
          },
          type: 'replaces',
        },
      ],
    };

    await client.updateResource(updatedPatient);
    this.logger.log(
      `Merged patient identifiers into patient: ${newPatientRecord.id}`,
    );

    const deprecatedPatient: Patient = {
      ...oldPatientRecord,
      active: false,
      link: [
        ...(oldPatientRecord.link || []),
        {
          other: {
            reference: `Patient/${newPatientRecord.id}`,
          },
          type: 'replaced-by',
        },
      ],
    };

    await client.updateResource(deprecatedPatient);
    this.logger.log(`Marked old patient as inactive: ${oldPatientRecord.id}`);
  }
}
