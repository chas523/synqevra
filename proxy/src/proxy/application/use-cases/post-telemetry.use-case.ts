import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MedplumConnectionService } from '../../../medplum/application/medplum-connection.service';
import { MedplumClient, QuantityUnit } from '@medplum/core';
import process from 'node:process';
import { Bundle, Coding, Device, Observation } from '@medplum/fhirtypes';
import {
  CODING_MAP,
  UNIT_MAP,
} from '../../domain/telemetry/measurement-definitions';
import { TelemetryObservationFactory } from '../../domain/telemetry/telemetry-aggregate';
import { PostTelemetryCommand } from '../dto/post-telemetry.command';
import { PostTelemetryResult } from '../dto/post-telemetry.result';
import { OperationStatus } from '../enums/operation-status.enum';

@Injectable()
export class PostTelemetryUseCase {
  constructor(private readonly medplum: MedplumConnectionService) {}

  private readonly logger = new Logger(PostTelemetryUseCase.name);

  private async getDeviceProfile(
    deviceId: string,
    tenantId: string,
  ): Promise<{ deviceId: string; patientRef: string }> {
    const client: MedplumClient =
      await this.medplum.initMedplumWithProjectId(tenantId);
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

  async execute(body: PostTelemetryCommand): Promise<PostTelemetryResult> {
    const client: MedplumClient = await this.medplum.initMedplumWithProjectId(
      body.tenantId,
    );
    const { deviceId, patientRef } = await this.getDeviceProfile(
      body.deviceId,
      body.tenantId,
    );

    const totalCount = Object.keys(body.data).length;
    if (totalCount === 0)
      throw new NotFoundException('No telemetry data provided');

    let savedCount = 0;
    let failedCount = 0;

    for (const [key, value] of Object.entries(body.data)) {
      const coding: Coding = CODING_MAP[key];
      const unit: QuantityUnit = UNIT_MAP[key];

      if (!coding) {
        failedCount++;
        continue;
      }

      let observation: Observation;
      try {
        observation = TelemetryObservationFactory.createObservation({
          coding,
          patientRef,
          medplumDeviceId: deviceId,
          tbDeviceId: body.deviceId,
          value,
          unit,
          timestamp: body.timestamp,
        });
      } catch (error) {
        this.logger.error('Error while creating Observation', error);
        failedCount++;
        continue;
      }

      try {
        const created = await client.createResource(observation);

        if (created) {
          savedCount++;
        } else {
          failedCount++;
        }
      } catch {
        this.logger.error('Error while creating resource');
        failedCount++;
      }
    }

    let status: OperationStatus;
    if (savedCount === 0) status = OperationStatus.FAIL;
    else if (savedCount < totalCount) status = OperationStatus.PARTIAL;
    else status = OperationStatus.SUCCESS;

    return {
      status,
      deviceId,
      patientRef,
      counts: {
        total: totalCount,
        saved: savedCount,
        failed: failedCount,
      },
    };
  }
}
