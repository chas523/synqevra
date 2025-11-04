import { Injectable, NotFoundException } from '@nestjs/common';
import * as process from 'node:process';
import { TelemetryDto } from './dtos/telemetryDto';
import { Bundle, Device, Observation, Coding } from '@medplum/fhirtypes';
import { MedplumClient, QuantityUnit } from '@medplum/core';
import {
  CODING_MAP,
  UNIT_MAP,
} from '../telemetry/constants/measurement-definitions';
import { PostSummaryDto } from './dtos/postSummaryDto';
import { Proxy } from './proxy';

@Injectable()
export class ProxyService {
  constructor(private readonly medplum: Proxy) {}

  private async getDeviceProfile(
    deviceId: string,
  ): Promise<{ deviceId: string; patientRef: string }> {
    const client: MedplumClient = await this.medplum.initMedplum();
    const tbUrl = process.env.TB_URL as string;

    const bundle = (await client.search('Device', {
      identifier: `${tbUrl}|${deviceId}`,
    })) as Bundle;

    const device = bundle.entry?.[0]?.resource as Device;

    if (!device)
      throw new NotFoundException(`Device with ID ${deviceId} not found`);

    return {
      deviceId: device.id as string,
      patientRef: device.patient?.reference as string,
    };
  }

  private createObservation(
    coding: Coding,
    patientRef: string,
    deviceId: string,
    tbDeviceId: string,
    value: number,
    unit: QuantityUnit,
    timestamp?: string,
  ): Observation {
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
        reference: `Device/${deviceId}`,
        identifier: { value: tbDeviceId },
      },
      effectiveDateTime: timestamp ?? new Date().toISOString(),
    };

    if (unit) {
      observation.valueQuantity = {
        value: value,
        unit: unit.unit,
        system: unit.system,
        code: unit.code,
      };
    } else {
      observation.valueString = value.toString();
    }

    return observation;
  }

  async postTelemetry(body: TelemetryDto) {
    const client: MedplumClient = await this.medplum.initMedplum();
    const data = await this.getDeviceProfile(body.deviceId);
    const { deviceId, patientRef } = data;

    const totalCount = Object.keys(body.data).length;
    if (totalCount === 0)
      throw new NotFoundException('No telemetry data provided');
    let savedCount = 0;
    let failedCount = 0;
    for (const entry of Object.entries(body.data)) {
      const [key, value] = entry;
      const coding: Coding = CODING_MAP[key];
      const unit: QuantityUnit = UNIT_MAP[key];
 
      console.log(!coding || !unit);
      //unit is optional, so we only check coding here
      if (!coding) {
        failedCount++;
        continue;
      }
      console.log('Creating observation for key:', key);
      let observation: Observation;
      try {
        observation = this.createObservation(
          coding,
          patientRef,
          deviceId, // medplum device id
          body.deviceId, // tb device id
          value,
          unit,
          body.timestamp,
        );
      } catch (error) {
        console.error('Error creating observation:', error);
        failedCount++;
        continue;
      }
      console.log('Observation created:', observation);
      try {
        const created = await client.createResource(observation);
        console.log('Resource created:', created);
        if (created) {
          savedCount++;
        } else {
          failedCount++;
        }
      } catch {
        console.error('Error creating resource');
        failedCount++;
      }
    }
    let status: 'SUCCESS' | 'PARTIAL' | 'FAIL';
    if (savedCount === 0) status = 'FAIL';
    else if (savedCount < totalCount) status = 'PARTIAL';
    else status = 'SUCCESS';

    const result: PostSummaryDto = {
      status: status,
      deviceId: deviceId,
      patientRef: patientRef,
      counts: {
        total: Object.keys(body.data).length,
        saved: savedCount,
        failed: failedCount,
      },
    };

    return result;
  }
}
