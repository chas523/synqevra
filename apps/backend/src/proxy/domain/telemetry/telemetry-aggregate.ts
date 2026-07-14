import { Coding, Observation } from '@medplum/fhirtypes';
import { QuantityUnit } from '@medplum/core';

export class TelemetryObservationFactory {
  static createObservation(params: {
    coding: Coding;
    patientRef: string;
    medplumDeviceId: string;
    tbDeviceId: string;
    value: number;
    unit?: QuantityUnit;
    timestamp?: string;
  }): Observation {
    const {
      coding,
      patientRef,
      medplumDeviceId,
      tbDeviceId,
      value,
      unit,
      timestamp,
    } = params;

    const observation: Observation = {
      resourceType: 'Observation',
      status: 'final',
      category: [
        {
          coding: [
            {
              system:
                'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'vital-signs',
              display: 'Vital Signs',
            },
          ],
        },
      ],
      code: { coding: [coding], text: coding.display },
      subject: { reference: patientRef },
      device: {
        reference: `Device/${medplumDeviceId}`,
        identifier: { value: tbDeviceId },
      },
      effectiveDateTime: timestamp ?? new Date().toISOString(),
    };

    if (unit) {
      observation.valueQuantity = {
        value,
        unit: unit.unit,
        system: unit.system,
        code: unit.code,
      };
    } else {
      observation.valueString = value.toString();
    }

    return observation;
  }
}
