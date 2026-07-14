import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import type { CurrentUser } from '../../../auth/types/current-user';
import { OutboxRepository } from '../../../outbox/domain/repositories/outbox.repository';
import { SubscriberType } from '../../../outbox/domain/subscribers/subscriber-type.enum';
import {
  THINGSBOARD_REPOSITORY_PORT,
  ThingsboardRepositoryPort,
} from '../../../thingsboard/application/ports/thingsboard.repository.port';
import {
  AlarmHistoryItemDto,
  AlarmHistoryResponseDto,
} from '../dto/alarm-history.response.dto';
import { AlarmRepository } from '../../domain/repositories/alarm.repository';

interface OutboxHistoryPayload {
  event?: {
    eventId?: string;
    alarmType?: string;
    ts?: string;
    data?: Record<string, unknown>;
    thresholdSnapshot?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  };
  alarm?: {
    status?: string;
  };
}

@Injectable()
export class GetAlarmHistoryUseCase {
  constructor(
    private readonly alarmRepository: AlarmRepository,
    private readonly outboxRepository: OutboxRepository,
    @Inject(THINGSBOARD_REPOSITORY_PORT)
    private readonly thingsboardRepository: ThingsboardRepositoryPort,
  ) {}

  async execute(params: {
    user: CurrentUser;
    alarmId: string;
    limit: number;
  }): Promise<AlarmHistoryResponseDto> {
    const thingsboardConnection = await this.thingsboardRepository.findByUserId(
      params.user.id,
    );

    if (!thingsboardConnection) {
      throw new NotFoundException('Tenant scope not found for current user');
    }

    const tenantId = thingsboardConnection.getTenantId();
    const alarm = await this.alarmRepository.findById(params.alarmId);

    if (!alarm || alarm.tenantId !== tenantId) {
      throw new NotFoundException('Alarm not found in current tenant scope');
    }

    const rows = await this.outboxRepository.findByAggregate({
      tenantId,
      aggregateType: 'alarm',
      aggregateId: params.alarmId,
      subscriberType: SubscriberType.WEB_APP,
      limit: params.limit,
    });

    return {
      alarmId: params.alarmId,
      items: rows.map((row) => this.mapOutboxRow(row)),
    };
  }

  private mapOutboxRow(row: {
    id: string;
    createdAt: Date;
    payload: Record<string, unknown>;
  }): AlarmHistoryItemDto {
    const payload = row.payload as OutboxHistoryPayload;

    return {
      outboxId: row.id,
      eventId: payload.event?.eventId ?? row.id,
      alarmType: payload.event?.alarmType ?? 'unknown',
      status: payload.alarm?.status,
      timestamp: payload.event?.ts ?? row.createdAt.toISOString(),
      createdAt: row.createdAt.toISOString(),
      telemetry: payload.event?.data ?? {},
      thresholdSnapshot: payload.event?.thresholdSnapshot ?? {},
      metadata: payload.event?.metadata ?? {},
    };
  }
}
