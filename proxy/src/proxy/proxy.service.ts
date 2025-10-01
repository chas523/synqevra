import { Injectable } from '@nestjs/common';
import * as process from 'node:process';
import { TelemetryDto } from './dtos/telemetryDto';
import { MedplumService } from '../medplum/medplum.service';
import { Bundle, Device, Observation } from '@medplum/fhirtypes';
import { MedplumClient } from '@medplum/core';

interface Coding {
  system: string;
  code: string;
  display: string;
}

interface QuantityUnit {
  unit: string;
  system: string;
  code: string;
}

const CODING_MAP: Record<string, Coding> = {
  temperature: {
    system: 'http://loinc.org',
    code: '8310-5',
    display: 'Body temperature',
  },
  heart_rate: {
    system: 'http://loinc.org',
    code: '8867-4',
    display: 'Heart rate',
  },
  respiratory_rate: {
    system: 'http://loinc.org',
    code: '9279-1',
    display: 'Respiratory rate',
  },
  blood_pressure_systolic: {
    system: 'http://loinc.org',
    code: '8480-6',
    display: 'Systolic blood pressure',
  },
  blood_pressure_diastolic: {
    system: 'http://loinc.org',
    code: '8462-4',
    display: 'Diastolic blood pressure',
  },
};

const UNIT_MAP: Record<string, QuantityUnit> = {
  temperature: {
    unit: '°C',
    system: 'http://unitsofmeasure.org',
    code: 'Cel',
  },
  heart_rate: {
    unit: 'beats/minute',
    system: 'http://unitsofmeasure.org',
    code: '/min',
  },
  respiratory_rate: {
    unit: 'breaths/minute',
    system: 'http://unitsofmeasure.org',
    code: '/min',
  },
  blood_pressure_systolic: {
    unit: 'mmHg',
    system: 'http://unitsofmeasure.org',
    code: 'mm[Hg]',
  },
  blood_pressure_diastolic: {
    unit: 'mmHg',
    system: 'http://unitsofmeasure.org',
    code: 'mm[Hg]',
  },
};

@Injectable()
export class ProxyService {
  constructor(private readonly medplum: MedplumService) {}

  private async getDeviceProfile(
    deviceId: string,
  ): Promise<{ deviceId: string; patientRef: string } | null> {
    try {
      const client: MedplumClient = await this.medplum.initMedplum();
      const tbUrl = process.env.TB_URL as string;

      const bundle = (await client.search('Device', {
        identifier: `${tbUrl}|${deviceId}`,
      })) as Bundle;

      const device = bundle.entry?.[0]?.resource as Device;

      if (device) {
        return {
          deviceId: device.id as string,
          patientRef: device.patient?.reference as string,
        };
      }
      return null;
    } catch (error) {
      throw new Error(`Error fetching device profile : ${error}`);
    }
  }

  private createObservation(
    coding: Coding,
    patientRef: string,
    deviceId: string,
    value: number,
    unit: QuantityUnit,
    timestamp?: string,
  ): Observation {
    return {
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
      device: { reference: `Device/${deviceId}` },
      effectiveDateTime: timestamp ?? new Date().toISOString(),
      valueQuantity: {
        value: value,
        unit: unit.unit,
        system: unit.system,
        code: unit.code,
      },
    };
  }

  async postTelemetry(body: TelemetryDto) {
    try {
      const data = await this.getDeviceProfile(body.deviceId);
      const client: MedplumClient = await this.medplum.initMedplum();
      console.log(data);

      const observations: Observation[] = [];

      if (data) {
        for (const entry of Object.entries(body.data)) {
          const [key, value] = entry;
          const coding: Coding = CODING_MAP[key];
          const unit: QuantityUnit = UNIT_MAP[key];
          const { deviceId, patientRef } = data;

          const observation: Observation = this.createObservation(
            coding,
            patientRef,
            deviceId,
            value,
            unit,
            body.timestamp,
          );

          const created = await client.createResource(observation);
          if (created) observations.push(created);
        }
        return observations;
      } else return null;
    } catch (error) {
      throw new Error(`Error posting telemetry: ${error}`);
    }
  }
}
