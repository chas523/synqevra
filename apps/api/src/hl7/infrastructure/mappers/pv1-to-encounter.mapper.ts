import { Injectable } from '@nestjs/common';
import { Hl7Message } from '@medplum/core';
import { Encounter, Patient, type Period } from '@medplum/fhirtypes';
import { AttendingDoctorField } from '../types/hl7-mapper.types';
import {
  mapADTTypeToEncounterStatus,
  mapHL7PatientClassToFHIR,
} from '../utils/hl7-mapping.utils';
import { formatHL7DateTime } from '../utils/datetime.utils';
import { OrganizationConfig } from '../../application/dto/organization-config.command';

export interface EncounterDraft {
  encounter?: Partial<Encounter>;
  attendingDoctorField?: AttendingDoctorField;
}

@Injectable()
export class Pv1ToEncounterMapper {
  map(
    message: Hl7Message,
    messageType: string,
    patient: Partial<Patient>,
    organizationConfig: OrganizationConfig,
  ): EncounterDraft {
    const pv1Segment = message.getSegment('PV1');
    if (!pv1Segment) {
      return {};
    }

    const patientClassField = pv1Segment.getField(2);
    const patientClassCode = patientClassField
      ? mapHL7PatientClassToFHIR(patientClassField.toString())
      : 'AMB';
    const patientReference = patient.id ? `Patient/${patient.id}` : undefined;

    const encounter: Partial<Encounter> = {
      resourceType: 'Encounter',
      status: mapADTTypeToEncounterStatus(messageType),
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: patientClassCode,
        display: patientClassField?.toString() || 'ambulatory',
      },
      subject: patientReference ? { reference: patientReference } : undefined,
      serviceProvider: {
        reference: `Organization/${organizationConfig.id}`,
        display: organizationConfig.name,
      },
    };

    let visitNumber = '';
    const visitNumberField = pv1Segment.getField(19);

    if (visitNumberField) visitNumber = visitNumberField.toString();
    if (!visitNumber) {
      const altVisitField = pv1Segment.getField(50);
      if (altVisitField) visitNumber = altVisitField.toString();
    }
    if (!visitNumber) {
      const altVisitField2 = pv1Segment.getField(51);
      if (altVisitField2) visitNumber = altVisitField2.toString();
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

    const attendingDoctorField = this.extractAttendingDoctorField(
      pv1Segment.getField(7),
    );

    return { encounter, attendingDoctorField };
  }

  merge(
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

  private extractAttendingDoctorField(
    field: unknown,
  ): AttendingDoctorField | undefined {
    if (
      field &&
      typeof field === 'object' &&
      'getComponent' in field &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      typeof (field as any).getComponent === 'function'
    ) {
      return field as AttendingDoctorField;
    }
    return undefined;
  }
}
