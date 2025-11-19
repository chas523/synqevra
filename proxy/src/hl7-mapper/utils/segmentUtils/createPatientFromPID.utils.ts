import type { Patient, HumanName, ContactPoint } from '@medplum/fhirtypes';
import { Hl7Message } from '@medplum/core';
import { Logger } from '@nestjs/common';
import { Hl7ParsingError } from 'src/hl7-mapper/pipes/hl7-to-fhir-pipe';
import { mapAssigningAuthority } from '../hl7-mapping.utils';
import { MedplumService } from 'src/medplum/medplum.service';

const logger = new Logger('CreatePatientFromPIDUtils');

interface OrganizationConfig {
  id: string;
  name: string;
  system: string;
}

export function createPatientFromPID(
  message: Hl7Message,
  organizationConfig: OrganizationConfig,
): Partial<Patient> {
  const pidSegment = message.getSegment('PID');
  if (!pidSegment) {
    logger.error('Missing required PID segment');
    throw new Hl7ParsingError('Missing required PID segment');
  }

  logger.log('Parsing PID segment for patient data');
  try {
    const patient: Partial<Patient> = {
      resourceType: 'Patient',
      managingOrganization: {
        reference: `Organization/${organizationConfig.id}`,
        display: organizationConfig.name,
      },
    };

    const patientIdField = pidSegment.getField(3);
    if (patientIdField) {
      const fieldString = patientIdField.toString();
      const repetitions = fieldString.split('~');
      const firstRepetition = repetitions[0];

      if (firstRepetition && firstRepetition.trim()) {
        const parts = firstRepetition.split('^');
        const idValue = parts[0];
        const idTypeCode = parts[4];
        const assigner = parts[3];

        if (idValue) {
          const system = mapAssigningAuthority(
            assigner,
            idTypeCode,
            organizationConfig.system,
          );

          patient.identifier = [
            {
              use: 'usual',
              system,
              value: idValue,
              type: idTypeCode
                ? {
                    coding: [
                      {
                        system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                        code: idTypeCode,
                      },
                    ],
                  }
                : undefined,
            },
          ];
        }
      }
    }

    const patientNameField = pidSegment.getField(5);
    if (patientNameField) {
      const familyName = patientNameField.getComponent(1) || '';
      const givenName = patientNameField.getComponent(2) || '';
      const middleName = patientNameField.getComponent(3) || '';

      const nameObject: HumanName = {
        use: 'official',
        given: [givenName, middleName].filter(Boolean),
      };

      if (familyName) {
        nameObject.family = familyName;
      }

      patient.name = [nameObject];
    }

    const birthDateField = pidSegment.getField(7);
    if (birthDateField) {
      const birthDate = birthDateField.toString();
      if (birthDate && birthDate.length >= 8) {
        const year = birthDate.substring(0, 4);
        const month = birthDate.substring(4, 6);
        const day = birthDate.substring(6, 8);
        patient.birthDate = `${year}-${month}-${day}`;
      }
    }

    const genderField = pidSegment.getField(8);
    if (genderField) {
      const gender = genderField.toString().toUpperCase();
      switch (gender) {
        case 'M':
          patient.gender = 'male';
          break;
        case 'F':
          patient.gender = 'female';
          break;
        case 'O':
          patient.gender = 'other';
          break;
        case 'U':
          patient.gender = 'unknown';
          break;
        default:
          patient.gender = 'unknown';
      }
    }

    const addressField = pidSegment.getField(11);
    if (addressField) {
      const streetAddress = addressField.getComponent(1) || '';
      const city = addressField.getComponent(3) || '';
      const state = addressField.getComponent(4) || '';
      const postalCode = addressField.getComponent(5) || '';
      const country = addressField.getComponent(6) || '';

      let countryCode = country;
      if (country === 'UNITED STATES OF AMERICA' || country === 'USA') {
        countryCode = 'US';
      }

      patient.address = [
        {
          use: 'home',
          line: [streetAddress].filter(Boolean),
          city: city,
          state: state,
          postalCode: postalCode,
          country: countryCode,
        },
      ];
    }

    const phoneField = pidSegment.getField(13);
    if (phoneField) {
      const telecom: ContactPoint[] = [];
      const phoneString = phoneField.toString();
      const phoneRepetitions = phoneString.split('~');

      for (const repetition of phoneRepetitions) {
        if (!repetition || !repetition.trim()) continue;

        const components = repetition.split('^');
        const phoneNumber = components[0];
        const useCode = components[1];
        const equipmentType = components[2];

        if (phoneNumber && phoneNumber.trim()) {
          let system:
            | 'phone'
            | 'fax'
            | 'email'
            | 'pager'
            | 'url'
            | 'sms'
            | 'other' = 'phone';
          let use: 'home' | 'work' | 'temp' | 'old' | 'mobile' = 'home';

          if (equipmentType) {
            const equipmentUpper = equipmentType.toUpperCase();
            if (equipmentUpper === 'CP') {
              system = 'phone';
              use = 'mobile';
            } else if (equipmentUpper === 'FX') {
              system = 'fax';
            } else if (equipmentUpper === 'Internet') {
              system = 'email';
            } else if (equipmentUpper === 'BP') {
              system = 'pager';
            } else if (equipmentUpper === 'PH') {
              system = 'phone';
            }
          }

          if (useCode) {
            const useUpper = useCode.toUpperCase();
            if (useUpper === 'PRN' || useUpper === 'H' || useUpper === 'ORN') {
              use = 'home';
            } else if (useUpper === 'WPN') {
              use = 'work';
            }
          }

          telecom.push({
            system,
            value: phoneNumber,
            use,
          });
        }
      }

      if (telecom.length > 0) {
        patient.telecom = telecom;
      }
    }

    return patient;
  } catch (error) {
    throw new Hl7ParsingError(
      `Error parsing PID segment: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export function prepareMergeData(
  hl7Message: Hl7Message,
  organizationConfig: OrganizationConfig,
): Promise<{ newPatient: Partial<Patient>; oldPatientIdentifier: string }> {
  const pidSegment = hl7Message.getSegment('PID');
  const mrgSegment = hl7Message.getSegment('MRG');

  const newId = pidSegment?.getField(3)?.toString();
  const oldId = mrgSegment?.getField(1)?.toString();

  if (!newId || !oldId) {
    throw new Hl7ParsingError(
      'Missing patient identifiers for merge operation',
    );
  }

  const newPatient = createPatientFromPID(hl7Message, organizationConfig);

  return Promise.resolve({
    newPatient,
    oldPatientIdentifier: oldId,
  });
}

export async function findPatientOptimized(
  tenantId: string,
  patient: Partial<Patient>,
  medplumService: MedplumService,
): Promise<Patient | null> {
  if (!patient.identifier || patient.identifier.length === 0) {
    return null;
  }

  const primaryIdentifier = patient.identifier[0];
  if (!primaryIdentifier.system || !primaryIdentifier.value) {
    return null;
  }

  try {
    logger.log(
      `Searching patient with primary identifier: ${primaryIdentifier.system}|${primaryIdentifier.value}`,
    );

    const foundPatient = await medplumService.findPatientByIdentifier(
      {
        system: primaryIdentifier.system,
        value: primaryIdentifier.value,
      },
      undefined,
      tenantId,
    );

    return foundPatient;
  } catch (error) {
    logger.error('Error in optimized patient search:', error);
    return null;
  }
}

export function mergePatientData(
  existingPatient: Patient,
  newPatient: Partial<Patient>,
): Patient {
  const existingIdentifiers = existingPatient.identifier || [];
  const newIdentifiers = newPatient.identifier || [];

  const mergedIdentifiers = [...existingIdentifiers];
  for (const newId of newIdentifiers) {
    const normalizedNewSystem = newId.system?.trim().toLowerCase();
    const normalizedNewValue = newId.value?.trim();

    const exists = mergedIdentifiers.some((existing) => {
      const normalizedExistingSystem = existing.system?.trim().toLowerCase();
      const normalizedExistingValue = existing.value?.trim();
      return (
        normalizedExistingSystem === normalizedNewSystem &&
        normalizedExistingValue === normalizedNewValue
      );
    });

    if (!exists) {
      mergedIdentifiers.push(newId);
    }
  }

  return {
    ...existingPatient,
    ...newPatient,
    identifier: mergedIdentifiers,
    resourceType: 'Patient',
  };
}
