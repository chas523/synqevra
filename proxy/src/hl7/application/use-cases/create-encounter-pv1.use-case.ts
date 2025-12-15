import { Injectable, Logger } from '@nestjs/common';
import {
  EncounterCreationResult,
  EncounterFromPv1Command,
} from '../dto/encounter-from-pv1.command';
import { MedplumClientPort } from '../../../medplum/application/ports/medplum-client.port';
import { Pv1ToEncounterMapper } from '../../infrastructure/mappers/pv1-to-encounter.mapper';
import { PractitionerLookupService } from '../services/practitioner-lookup.service';

@Injectable()
export class CreateEncounterPv1UseCase {
  constructor(
    private readonly mapper: Pv1ToEncounterMapper,
    private readonly lookupService: PractitionerLookupService,
    private readonly medplum: MedplumClientPort,
  ) {}

  private readonly logger = new Logger(CreateEncounterPv1UseCase.name);

  async execute(
    command: EncounterFromPv1Command,
  ): Promise<EncounterCreationResult> {
    const { encounter, attendingDoctorField } = this.mapper.map(
      command.message,
      command.messageType,
      command.patient,
      command.organizationConfig,
    );

    if (!encounter) {
      this.logger.log('No PV1 segment found - skipping encounter creation');
      return {};
    } else {
      this.logger.log('PV1 segment found - creating encounter');
    }

    const practitionersToCreate: Array<Partial<any>> = [];
    const lookupResult = await this.lookupService.handle(
      attendingDoctorField,
      command.tenantId,
      command.organizationConfig.system,
    );

    if (lookupResult.reference) {
      encounter.participant = [
        {
          type: [
            {
              coding: [
                {
                  system:
                    'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                  code: 'ATND',
                  display: 'attender',
                },
              ],
            },
          ],
          individual: {
            reference: lookupResult.reference,
          },
        },
      ];
    }

    if (lookupResult.practitionerToCreate) {
      practitionersToCreate.push(lookupResult.practitionerToCreate);
    }

    const existingEncounter = await this.medplum.findExistingEncounter(
      command.tenantId,
      encounter,
    );

    if (existingEncounter) {
      this.logger.log(`Found existing encounter: ${existingEncounter.id}`);
    } else {
      this.logger.log('Encounter not found - will be created as new');
    }

    const finalEncounter = existingEncounter
      ? this.mapper.merge(existingEncounter, encounter)
      : encounter;

    return {
      encounter: finalEncounter,
      practitionersToCreate:
        practitionersToCreate.length > 0 ? practitionersToCreate : undefined,
    };
  }
}
