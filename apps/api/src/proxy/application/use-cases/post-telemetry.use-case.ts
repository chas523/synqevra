import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MedplumClientFactory } from '../../../medplum/application/medplum-client.factory';
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
  constructor(private readonly medplum: MedplumClientFactory) {}

  private readonly logger = new Logger(PostTelemetryUseCase.name);

  private async getDeviceProfile(
    deviceId: string,
    tenantId: string,
  ): Promise<{ deviceId: string; patientRef: string }> {
    const client: MedplumClient = await this.medplum.initMedplum(
      undefined,
      tenantId,
    );
    const identifierSystem = this.getTbIdentifierSystem();
    const normalizedDeviceId = deviceId.trim();

    const [bundleBySystemAndValue, bundleByValueOnly] = (await Promise.all([
      client.search('Device', {
        identifier: `${identifierSystem}|${normalizedDeviceId}`,
      }),
      client.search('Device', {
        identifier: normalizedDeviceId,
      }),
    ])) as [Bundle, Bundle];

    const allDevices = [
      ...(bundleBySystemAndValue.entry ?? []),
      ...(bundleByValueOnly.entry ?? []),
    ]
      .map((entry) => entry.resource as Device)
      .filter((resource): resource is Device => resource?.resourceType === 'Device');

    const deduplicated = Array.from(
      new Map(allDevices.map((device) => [device.id, device])).values(),
    );

    this.logSystemMismatchIfAny(
      deduplicated,
      normalizedDeviceId,
      identifierSystem,
    );

    const matches = deduplicated.filter((device) =>
      this.deviceMatchesThingsboardId(device, identifierSystem, normalizedDeviceId),
    );

    if (matches.length === 0) {
      throw new NotFoundException(
        `Device with ThingsBoard ID ${deviceId} not found`,
      );
    }

    if (matches.length > 1) {
      this.logger.error(
        `Ambiguous Device match for ThingsBoard ID ${deviceId}. Matched device resource IDs: ${matches
          .map((d) => d.id)
          .join(', ')}`,
      );
      throw new NotFoundException(
        `Ambiguous device mapping for ThingsBoard ID ${deviceId}`,
      );
    }

    const device = matches[0];

    if (!device.patient?.reference) {
      throw new NotFoundException(
        `Device ${device.id} is not assigned to a patient`,
      );
    }

    return {
      deviceId: device.id as string,
      patientRef: device.patient?.reference as string,
    };
  }

  private deviceMatchesThingsboardId(
    device: Device,
    identifierSystem: string,
    thingsboardDeviceId: string,
  ): boolean {
    const identifiers = device.identifier ?? [];

    return identifiers.some((identifier) => {
      const system = identifier.system?.trim();
      const value = identifier.value?.trim();

      if (!value) {
        return false;
      }

      return system === identifierSystem && value === thingsboardDeviceId;
    });
  }

  private getTbIdentifierSystem(): string {
    const configured = process.env.TB_SYSTEM_VALUE?.trim();
    return configured && configured.length > 0
      ? configured
      : 'thingsboard:device';
  }

  private logSystemMismatchIfAny(
    devices: Device[],
    thingsboardDeviceId: string,
    expectedSystem: string,
  ): void {
    const mismatches = devices
      .map((device) => {
        const wrongSystems = (device.identifier ?? [])
          .filter((identifier) => identifier.value?.trim() === thingsboardDeviceId)
          .map((identifier) => identifier.system?.trim())
          .filter((system): system is string => Boolean(system && system !== expectedSystem));

        return {
          deviceId: device.id,
          wrongSystems,
        };
      })
      .filter((entry) => entry.wrongSystems.length > 0);

    if (mismatches.length > 0) {
      const mismatchDetails = mismatches
        .map((entry) => `device=${entry.deviceId}: actual=[${entry.wrongSystems.join(', ')}], expected=${expectedSystem}`)
        .join(' | ');

      this.logger.error(
        `Invalid Medplum Device identifier system for TB device ${thingsboardDeviceId}. ${mismatchDetails}`,
      );
    }
  }

  async execute(body: PostTelemetryCommand): Promise<PostTelemetryResult> {
    const client: MedplumClient = await this.medplum.initMedplum(
      undefined,
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
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : JSON.stringify(error ?? 'Unknown error');

        this.logger.error(
          `Error while creating Observation resource: tenantId=${body.tenantId}, tbDeviceId=${body.deviceId}, medplumDeviceId=${deviceId}, metric=${key}, ts=${body.timestamp ?? 'now'}, reason=${message}`,
        );
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
