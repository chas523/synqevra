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
import { MedplumConnectionService } from '../connection/medplum-connection.service';

@Injectable()
export class ProxyService {
  constructor(private readonly medplum: MedplumConnectionService) {}

  private async getDeviceProfile(
    deviceId: string,
  ): Promise<{ deviceId: string; patientRef: string }> {
    const client: MedplumClient = await this.medplum.initMedplum(1);
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
    const client: MedplumClient = await this.medplum.initMedplum(1);
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

      if (!coding || !unit) {
        failedCount++;
        continue;
      }

      const observation: Observation = this.createObservation(
        coding,
        patientRef,
        deviceId,
        value,
        unit,
        body.timestamp,
      );

      try {
        const created = await client.createResource(observation);
        if (created) {
          savedCount++;
        } else {
          failedCount++;
        }
      } catch {
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
