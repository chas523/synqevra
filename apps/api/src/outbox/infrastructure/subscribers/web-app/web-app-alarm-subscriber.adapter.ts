import { Injectable, Logger } from '@nestjs/common';

import { AlarmSubscriber } from '../../../domain/subscribers/alarm-subscriber.port';
import { NormalizedAlarmEventPayload } from '../../../domain/subscribers/alarm-event.payload';
import { SubscriberType } from '../../../domain/subscribers/subscriber-type.enum';
import { OutboxEvent } from '../../persistence/outbox-event.entity';
import {
  AlarmGateway,
  WebAppAlarmEventPayload,
} from '../../../interface/websocket/alarm.gateway';

interface OutboxAlarmPayload {
  schemaVersion: number;
  event: NormalizedAlarmEventPayload;
  alarm?: {
    alarmId: string;
    status?: string;
    currentValue?: Record<string, unknown>;
    thresholdSnapshot?: Record<string, unknown>;
  };
}

@Injectable()
export class WebAppAlarmSubscriberAdapter implements AlarmSubscriber {
  readonly type = SubscriberType.WEB_APP;

  private readonly logger = new Logger(WebAppAlarmSubscriberAdapter.name);

  constructor(private readonly alarmGateway: AlarmGateway) {}

  deliver(outboxEvent: OutboxEvent): Promise<void> {
    const payload = this.parsePayload(outboxEvent.payload);

    const eventPayload: WebAppAlarmEventPayload = {
      schemaVersion: 1,
      alarmId: payload.alarm?.alarmId ?? outboxEvent.aggregateId,
      tenantId: payload.event.tenantId,
      deviceId: payload.event.deviceId,
      alarmType: payload.event.alarmType,
      status: payload.alarm?.status,
      currentValue: payload.alarm?.currentValue ?? payload.event.data ?? {},
      thresholdSnapshot:
        payload.alarm?.thresholdSnapshot ??
        payload.event.thresholdSnapshot ??
        {},
      eventId: payload.event.eventId,
      timestamp: payload.event.ts,
      metadata: payload.event.metadata ?? {},
    };

    this.alarmGateway.emitAlarmForTenant(payload.event.tenantId, eventPayload);

    this.logger.log(
      `WEB_APP subscriber delivered outboxId=${outboxEvent.id}, tenantId=${eventPayload.tenantId}, alarmId=${eventPayload.alarmId}`,
    );

    return Promise.resolve();
  }

  private parsePayload(payload: Record<string, unknown>): OutboxAlarmPayload {
    const schemaVersion = payload.schemaVersion;
    const event = payload.event;

    if (schemaVersion !== 1 || !event || typeof event !== 'object') {
      throw new Error(
        'Unsupported outbox payload format for WEB_APP subscriber',
      );
    }

    return payload as unknown as OutboxAlarmPayload;
  }
}
