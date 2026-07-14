import { Injectable, Logger } from '@nestjs/common';
import { Hl7Message } from '@medplum/core';
import type { Hl7Segment } from '@medplum/core';
import { OrganizationConfig } from '../../application/dto/organization-config.command';
import { Hl7ParsingError } from '../../interface/pipes/hl7-to-fhir-pipe';
import { type ContactPoint, type HumanName, Patient } from '@medplum/fhirtypes';
import { mapAssigningAuthority } from '../utils/hl7-mapping.utils';

@Injectable()
export class PidToPatientMapper {
  private readonly logger = new Logger(PidToPatientMapper.name);

  map(
    message: Hl7Message,
    organizationConfig: OrganizationConfig,
  ): Partial<Patient> {
    const pidSegment: Hl7Segment | undefined = message.getSegment('PID');
    if (!pidSegment) {
      this.logger.error('Missing required PID segment');
      throw new Hl7ParsingError('Missing required PID segment');
    }

    this.logger.log('Parsing PID segment for patient data');

    try {
      const patient: Partial<Patient> = {
        resourceType: 'Patient',
        managingOrganization: {
          reference: `Organization/${organizationConfig.id}`,
          display: organizationConfig.name,
        },
      };

      this.mapIdentifier(pidSegment, patient, organizationConfig);
      this.mapName(pidSegment, patient);
      this.mapBirthDate(pidSegment, patient);
      this.mapGender(pidSegment, patient);
      this.mapAddress(pidSegment, patient);
      this.mapPhone(pidSegment, patient);

      return patient;
    } catch (error) {
      this.logger.error('Error while mapping PID segment', error as Error);
      throw new Hl7ParsingError(
        `Error parsing PID segment: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  mapMergeData(
    hl7Message: Hl7Message,
    organizationConfig: OrganizationConfig,
  ): { newPatient: Partial<Patient>; oldPatientIdentifier: string } {
    const pidSegment = hl7Message.getSegment('PID');
    const mrgSegment = hl7Message.getSegment('MRG');
    const newId = pidSegment?.getField(3)?.toString();
    const oldId = mrgSegment?.getField(1)?.toString();

    if (!newId || !oldId) {
      throw new Hl7ParsingError(
        'Missing patient identifiers for merge operation',
      );
    }

    const newPatient = this.map(hl7Message, organizationConfig);
    return {
      newPatient,
      oldPatientIdentifier: oldId,
    };
  }

  mergePatientData(
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

  private mapIdentifier(
    pidSegment: Hl7Segment,
    patient: Partial<Patient>,
    organizationConfig: OrganizationConfig,
  ) {
    const patientIdField = pidSegment.getField(3);
    if (!patientIdField) return;

    const fieldString = patientIdField.toString();
    const repetitions = fieldString.split('~');
    const firstRepetition = repetitions[0];

    if (!firstRepetition || !firstRepetition.trim()) return;

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

  private mapName(pidSegment: Hl7Segment, patient: Partial<Patient>) {
    const patientNameField = pidSegment.getField(5);
    if (!patientNameField) return;

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

  private mapBirthDate(pidSegment: Hl7Segment, patient: Partial<Patient>) {
    const birthDateField = pidSegment.getField(7);
    if (!birthDateField) return;

    const birthDate = birthDateField.toString();
    if (birthDate && birthDate.length >= 8) {
      const year = birthDate.substring(0, 4);
      const month = birthDate.substring(4, 6);
      const day = birthDate.substring(6, 8);
      patient.birthDate = `${year}-${month}-${day}`;
    }
  }

  private mapGender(pidSegment: Hl7Segment, patient: Partial<Patient>) {
    const genderField = pidSegment.getField(8);
    if (!genderField) return;

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

  private mapAddress(pidSegment: Hl7Segment, patient: Partial<Patient>) {
    const addressField = pidSegment.getField(11);
    if (!addressField) return;

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

  private mapPhone(pidSegment: Hl7Segment, patient: Partial<Patient>) {
    const phoneField = pidSegment.getField(13);
    if (!phoneField) return;

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

        if (telecom.length > 0) {
          patient.telecom = telecom;
        }
      }
    }
  }
}
