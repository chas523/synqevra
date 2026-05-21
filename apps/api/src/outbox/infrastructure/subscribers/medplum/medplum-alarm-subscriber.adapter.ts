import { Injectable, Logger } from '@nestjs/common';

import { PostTelemetryCommand } from '../../../../proxy/application/dto/post-telemetry.command';
import { OperationStatus } from '../../../../proxy/application/enums/operation-status.enum';
import { PostTelemetryUseCase } from '../../../../proxy/application/use-cases/post-telemetry.use-case';
import { OutboxEvent } from '../../../infrastructure/persistence/outbox-event.entity';
import { AlarmSubscriber } from '../../../domain/subscribers/alarm-subscriber.port';
import { NormalizedAlarmEventPayload } from '../../../domain/subscribers/alarm-event.payload';
import { SubscriberType } from '../../../domain/subscribers/subscriber-type.enum';

interface OutboxAlarmPayload {
  schemaVersion: number;
  event: NormalizedAlarmEventPayload;
}

@Injectable()
export class MedplumAlarmSubscriberAdapter implements AlarmSubscriber {
  readonly type = SubscriberType.MEDPLUM;

  private readonly logger = new Logger(MedplumAlarmSubscriberAdapter.name);

  constructor(private readonly postTelemetryUseCase: PostTelemetryUseCase) {}

  async deliver(outboxEvent: OutboxEvent): Promise<void> {
    const payload = this.parsePayload(outboxEvent.payload);
    const numericData = this.toNumericTelemetry(payload.event.data);

    const command: PostTelemetryCommand = {
      deviceId: payload.event.deviceId,
      tenantId: payload.event.tenantId,
      timestamp: payload.event.ts,
      data: numericData,
    };

    const result = await this.postTelemetryUseCase.execute(command);

    if (result.status === OperationStatus.FAIL) {
      throw new Error(
        `Medplum subscriber failed for outboxId=${outboxEvent.id}, deviceId=${command.deviceId}`,
      );
    }

    this.logger.log(
      `Medplum subscriber delivered outboxId=${outboxEvent.id}, status=${result.status}, saved=${result.counts.saved}, failed=${result.counts.failed}`,
    );
  }

  private toNumericTelemetry(
    data: Record<string, unknown>,
  ): Record<string, number> {
    const normalized: Record<string, number> = {};

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'number' && Number.isFinite(value)) {
        normalized[key] = value;
      }
    }

    return normalized;
  }

  private parsePayload(payload: Record<string, unknown>): OutboxAlarmPayload {
    const schemaVersion = payload.schemaVersion;
    const event = payload.event;

    if (schemaVersion !== 1 || !event || typeof event !== 'object') {
      throw new Error(
        'Unsupported outbox payload format for Medplum subscriber',
      );
    }

    return payload as unknown as OutboxAlarmPayload;
  }
}
