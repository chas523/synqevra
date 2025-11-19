import type {
  Patient,
  Encounter,
  Practitioner,
  Period,
} from '@medplum/fhirtypes';
import { Hl7Message } from '@medplum/core';
import { Logger } from '@nestjs/common';
import {
  mapHL7PatientClassToFHIR,
  mapADTTypeToEncounterStatus,
} from '../hl7-mapping.utils';
import { formatHL7DateTime } from '../datetime.utils';
import { AttendingDoctorField } from 'src/hl7-mapper/types/hl7-mapper.types';
import { Cache } from 'cache-manager';
import { CACHE_CONFIG } from 'src/hl7-mapper/constants/cache.constants';
import { MedplumService } from 'src/medplum/medplum.service';

const logger = new Logger('CreateEncounterFromPV1Utils');

export interface PractitionerCacheEntry {
  practitioner: Practitioner;
}

interface EncounterCreationResult {
  encounter?: Partial<Encounter>;
  practitionersToCreate?: Array<Partial<Practitioner>>;
}

interface PractitionerLookupResult {
  reference?: string;
  practitionerToCreate?: Partial<Practitioner>;
}

interface OrganizationConfig {
  id: string;
  name: string;
  system: string;
}

export async function createEncounterFromPV1(
  message: Hl7Message,
  messageType: string,
  tenantId: string,
  patient: Partial<Patient>,
  cacheManager: Cache,
  medplumService: MedplumService,
  organizationConfig: OrganizationConfig,
): Promise<EncounterCreationResult> {
  const pv1Segment = message.getSegment('PV1');
  if (!pv1Segment) {
    logger.log('No PV1 segment found - skipping encounter creation');
    return {};
  }

  logger.log('PV1 segment found - creating encounter');
  try {
    const patientClassField = pv1Segment.getField(2);
    const patientClassCode = patientClassField
      ? mapHL7PatientClassToFHIR(patientClassField.toString())
      : 'AMB';

    const patientReference = patient.id ? `Patient/${patient.id}` : undefined;

    let encounter: Partial<Encounter> = {
      resourceType: 'Encounter',
      status: mapADTTypeToEncounterStatus(messageType),
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: patientClassCode,
        display: patientClassField?.toString() || 'ambulatory',
      },
      subject: patientReference
        ? {
            reference: patientReference,
          }
        : undefined,
      serviceProvider: {
        reference: `Organization/${organizationConfig.id}`,
        display: organizationConfig.name,
      },
    };

    let visitNumber = '';
    const visitNumberField = pv1Segment.getField(19);
    if (visitNumberField) {
      visitNumber = visitNumberField.toString();
    }

    if (!visitNumber) {
      const altVisitField = pv1Segment.getField(50);
      if (altVisitField) {
        visitNumber = altVisitField.toString();
      }
    }

    if (!visitNumber) {
      const altVisitField2 = pv1Segment.getField(51);
      if (altVisitField2) {
        visitNumber = altVisitField2.toString();
      }
    }

    if (visitNumber) {
      encounter.identifier = [
        {
          use: 'usual',
          system: `${organizationConfig.system}/encounters`,
          value: visitNumber,
        },
      ];
    }

    const admitDateTimeField = pv1Segment.getField(44);
    const dischargeDateTimeField = pv1Segment.getField(45);

    const period: Period = {};

    if (admitDateTimeField) {
      const admitDateTime = formatHL7DateTime(admitDateTimeField.toString());
      if (admitDateTime) period.start = admitDateTime;
    }

    if (dischargeDateTimeField) {
      const dischargeDateTime = formatHL7DateTime(
        dischargeDateTimeField.toString(),
      );
      if (dischargeDateTime) period.end = dischargeDateTime;
    }

    if (Object.keys(period).length > 0) {
      encounter.period = period;
    }

    const attendingDoctorField = pv1Segment.getField(7);
    const practitionersToCreate: Array<Partial<Practitioner>> = [];
    if (attendingDoctorField) {
      const practitionerResult = await createOrFindPractitioner(
        attendingDoctorField as unknown as AttendingDoctorField,
        tenantId,
        cacheManager,
        medplumService,
        organizationConfig,
      );

      if (practitionerResult.reference) {
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
              reference: practitionerResult.reference,
            },
          },
        ];
      }

      if (practitionerResult.practitionerToCreate) {
        practitionersToCreate.push(practitionerResult.practitionerToCreate);
      }
    }

    const existingEncounter = await findExistingEncounter(
      tenantId,
      encounter,
      medplumService,
    );

    if (existingEncounter) {
      logger.log(`Found existing encounter: ${existingEncounter.id}`);
      encounter = mergeEncounterData(existingEncounter, encounter);
    } else {
      logger.log('Encounter not found - will be created as new');
    }

    return {
      encounter,
      practitionersToCreate:
        practitionersToCreate.length > 0 ? practitionersToCreate : undefined,
    };
  } catch (error) {
    logger.warn('Error creating encounter from PV1:', error);
    return {};
  }

  async function createOrFindPractitioner(
    attendingDoctorField: AttendingDoctorField,
    tenantId: string,
    cacheManager: Cache,
    medplumService: MedplumService,
    organizationConfig: OrganizationConfig,
  ): Promise<PractitionerLookupResult> {
    if (!attendingDoctorField) {
      return {};
    }

    try {
      const doctorId = attendingDoctorField.getComponent(1);
      const doctorLastName = attendingDoctorField.getComponent(2);
      const doctorFirstName = attendingDoctorField.getComponent(3);

      if (!doctorId && !doctorLastName) {
        return {};
      }

      const cacheKey = `${CACHE_CONFIG.KEYS.PRACTITIONER_PREFIX}${
        doctorId
          ? `id:${doctorId}`
          : `name:${doctorLastName}^${doctorFirstName}`
      }`;

      const cachedEntry =
        await cacheManager.get<PractitionerCacheEntry>(cacheKey);
      if (cachedEntry) {
        logger.log(`Found cached practitioner: ${cachedEntry.practitioner.id}`);
        return { reference: `Practitioner/${cachedEntry.practitioner.id}` };
      }

      let practitioner: Practitioner | null = null;

      if (doctorId) {
        practitioner = await medplumService.findPractitionerById(
          doctorId,
          undefined,
          tenantId,
        );
      }

      if (!practitioner && doctorLastName) {
        practitioner = await medplumService.findPractitionerByName(
          doctorLastName,
          doctorFirstName || '',
          undefined,
          tenantId,
        );
      }

      if (practitioner) {
        await cacheManager.set(
          cacheKey,
          { practitioner },
          CACHE_CONFIG.TTL.PRACTITIONER_CACHE,
        );
        logger.log(`Found existing practitioner: ${practitioner.id}`);
        return { reference: `Practitioner/${practitioner.id}` };
      } else {
        logger.log('Practitioner not found - creating new practitioner object');
        const newPractitioner: Partial<Practitioner> = {
          resourceType: 'Practitioner',
          identifier: doctorId
            ? [
                {
                  system: organizationConfig.system,
                  value: doctorId,
                },
              ]
            : undefined,
          name: [
            {
              use: 'official',
              family: doctorLastName,
              given: [doctorFirstName].filter((name): name is string =>
                Boolean(name),
              ),
            },
          ],
        };
        return { practitionerToCreate: newPractitioner };
      }
    } catch (error) {
      logger.warn('Error creating/finding practitioner:', error);
      return {};
    }
  }

  async function findExistingEncounter(
    tenantId: string,
    encounter: Partial<Encounter>,
    medplumService: MedplumService,
  ): Promise<Encounter | null> {
    if (!encounter.identifier || encounter.identifier.length === 0) {
      return null;
    }

    const identifier = encounter.identifier[0];
    if (!identifier.system || !identifier.value) {
      return null;
    }

    try {
      logger.log(
        `Searching encounter with identifier: ${identifier.system}|${identifier.value}`,
      );

      const foundEncounter = await medplumService.findEncounterByIdentifier(
        {
          system: identifier.system,
          value: identifier.value,
        },
        undefined,
        tenantId,
      );

      return foundEncounter;
    } catch (error) {
      logger.error('Error searching for encounter:', error);
      return null;
    }
  }

  function mergeEncounterData(
    existingEncounter: Encounter,
    newEncounter: Partial<Encounter>,
  ): Encounter {
    return {
      ...existingEncounter,
      ...newEncounter,
      id: existingEncounter.id,
      resourceType: 'Encounter',
    };
  }
}
