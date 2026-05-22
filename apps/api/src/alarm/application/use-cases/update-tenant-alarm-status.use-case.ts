import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import type { CurrentUser } from "../../../auth/types/current-user";
import { OutboxStatus } from "../../../outbox/domain/enums/outbox-status.enum";
import { OutboxRepository } from "../../../outbox/domain/repositories/outbox.repository";
import { SubscriberType } from "../../../outbox/domain/subscribers/subscriber-type.enum";
import { OutboxEvent } from "../../../outbox/infrastructure/persistence/outbox-event.entity";
import {
  THINGSBOARD_REPOSITORY_PORT,
  ThingsboardRepositoryPort,
} from "../../../thingsboard/application/ports/thingsboard.repository.port";
import { AlarmStatus } from "../../domain/enums/alarm-status.enum";
import { AlarmRepository } from "../../domain/repositories/alarm.repository";
import { AlarmFsmService } from "../../domain/services/alarm-fsm.service";
import { TenantAlarmResponseDto } from "../dto/tenant-alarms.response.dto";
import { UpdateTenantAlarmStatusParamsDto } from "../dto/update-tenant-alarm-status.dto";

@Injectable()
export class UpdateTenantAlarmStatusUseCase {
  constructor(
    private readonly alarmRepository: AlarmRepository,
    private readonly alarmFsmService: AlarmFsmService,
    private readonly outboxRepository: OutboxRepository,
    @Inject(THINGSBOARD_REPOSITORY_PORT)
    private readonly thingsboardRepository: ThingsboardRepositoryPort,
  ) {}

  async execute(params: {
    user: CurrentUser;
    payload: UpdateTenantAlarmStatusParamsDto;
  }): Promise<TenantAlarmResponseDto> {
    const thingsboardConnection = await this.thingsboardRepository.findByUserId(
      params.user.id,
    );

    if (!thingsboardConnection) {
      throw new NotFoundException("Tenant scope not found for current user");
    }

    const tenantId = thingsboardConnection.getTenantId();
    const alarm = await this.alarmRepository.findById(params.payload.alarmId);

    if (!alarm || alarm.tenantId !== tenantId) {
      throw new NotFoundException("Alarm not found in current tenant scope");
    }

    const now = new Date();
    const previousStatus = alarm.status;

    try {
      alarm.status = this.alarmFsmService.nextOnManualUpdate(
        alarm.status,
        params.payload.status,
      );
    } catch {
      throw new BadRequestException("Invalid alarm status transition");
    }

    if (alarm.status === AlarmStatus.OPEN_UNACK) {
      alarm.acknowledgedAt = undefined;
      alarm.acknowledgedBy = undefined;
      alarm.resolvedAt = undefined;
    }

    if (alarm.status === AlarmStatus.OPEN_ACK) {
      alarm.acknowledgedAt = now;
      alarm.acknowledgedBy = String(params.user.id);
      alarm.resolvedAt = undefined;
    }

    if (alarm.status === AlarmStatus.RESOLVED) {
      if (!alarm.acknowledgedAt) {
        alarm.acknowledgedAt = now;
        alarm.acknowledgedBy = String(params.user.id);
      }
      alarm.resolvedAt = now;
    }

    const savedAlarm = await this.alarmRepository.save(alarm);

    await this.outboxRepository.save(
      this.createWebAppOutboxEvent({
        alarm: savedAlarm,
        previousStatus,
        updatedBy: String(params.user.id),
        timestamp: now,
      }),
    );

    return this.toDto(savedAlarm);
  }

  private toDto(alarm: {
    id: string;
    tenantId: string;
    deviceId: string;
    alarmType: string;
    status: string;
    lastEventId: string;
    currentValue?: Record<string, unknown>;
    thresholdSnapshot?: Record<string, unknown>;
    suppressed: boolean;
    acknowledgedAt?: Date;
    resolvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }): TenantAlarmResponseDto {
    return {
      id: alarm.id,
      tenantId: alarm.tenantId,
      deviceId: alarm.deviceId,
      alarmType: alarm.alarmType,
      status: alarm.status as TenantAlarmResponseDto["status"],
      lastEventId: alarm.lastEventId,
      currentValue: alarm.currentValue ?? {},
      thresholdSnapshot: alarm.thresholdSnapshot ?? {},
      suppressed: alarm.suppressed,
      acknowledgedAt: alarm.acknowledgedAt?.toISOString(),
      resolvedAt: alarm.resolvedAt?.toISOString(),
      createdAt: alarm.createdAt.toISOString(),
      updatedAt: alarm.updatedAt.toISOString(),
    };
  }

  private createWebAppOutboxEvent(params: {
    alarm: {
      id: string;
      tenantId: string;
      deviceId: string;
      alarmType: string;
      status: AlarmStatus;
      currentValue?: Record<string, unknown>;
      thresholdSnapshot?: Record<string, unknown>;
    };
    previousStatus: AlarmStatus;
    updatedBy: string;
    timestamp: Date;
  }): OutboxEvent {
    const event = new OutboxEvent();
    const eventId = `manual-status-${params.alarm.id}-${params.timestamp.getTime()}`;

    event.tenantId = params.alarm.tenantId;
    event.aggregateType = "alarm";
    event.aggregateId = params.alarm.id;
    event.subscriberType = SubscriberType.WEB_APP;
    event.status = OutboxStatus.PENDING;
    event.attempts = 0;
    event.nextAttemptAt = params.timestamp;
    event.payload = {
      schemaVersion: 1,
      event: {
        eventId,
        tenantId: params.alarm.tenantId,
        deviceId: params.alarm.deviceId,
        alarmType: params.alarm.alarmType,
        ts: params.timestamp.toISOString(),
        data: params.alarm.currentValue ?? {},
        thresholdSnapshot: params.alarm.thresholdSnapshot ?? {},
        metadata: {
          source: "manual_status_update",
          previousStatus: params.previousStatus,
          nextStatus: params.alarm.status,
          updatedBy: params.updatedBy,
        },
      },
      alarm: {
        alarmId: params.alarm.id,
        status: params.alarm.status,
        currentValue: params.alarm.currentValue ?? {},
        thresholdSnapshot: params.alarm.thresholdSnapshot ?? {},
      },
    };

    return event;
  }
}
