import { createHash } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DataSource } from 'typeorm';

import { IdempotencyRepository } from '../../../../idempotency/domain/repositories/idempotency.repository';
import { OutboxStatus } from '../../../../outbox/domain/enums/outbox-status.enum';
import { OutboxRepository } from '../../../../outbox/domain/repositories/outbox.repository';
import { OutboxEvent } from '../../../../outbox/infrastructure/persistence/outbox-event.entity';
import { AlarmStatus } from '../../../domain/enums/alarm-status.enum';
import { AlarmRepository } from '../../../domain/repositories/alarm.repository';
import { AlarmFsmService } from '../../../domain/services/alarm-fsm.service';
import { Alarm } from '../../../infrastructure/persistence/alarm.entity';

import { ProcessAbnormalEventCommand } from './process-abnormal-event.command';

export interface ProcessAbnormalEventResult {
  deduplicated: boolean;
  alarmId?: string;
}

@Injectable()
@CommandHandler(ProcessAbnormalEventCommand)
export class ProcessAbnormalEventCommandHandler implements ICommandHandler<
  ProcessAbnormalEventCommand,
  ProcessAbnormalEventResult
> {
  private readonly logger = new Logger(ProcessAbnormalEventCommandHandler.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly alarmRepository: AlarmRepository,
    private readonly idempotencyRepository: IdempotencyRepository,
    private readonly outboxRepository: OutboxRepository,
    private readonly alarmFsmService: AlarmFsmService,
  ) {}

  async execute(
    command: ProcessAbnormalEventCommand,
  ): Promise<ProcessAbnormalEventResult> {
    const payloadHash = createHash('sha256')
      .update(JSON.stringify(command.event))
      .digest('hex');

    const normalizedAlarmType =
      command.event.alarmType?.trim() || 'abnormal_telemetry';
    const normalizedEventId =
      command.event.eventId?.trim() ||
      `${command.event.tenantId}:${command.event.deviceId}:${normalizedAlarmType}:${command.event.ts || ''}:${payloadHash.slice(0, 16)}`;
    const normalizedEvent = {
      eventId: normalizedEventId,
      tenantId: command.event.tenantId,
      deviceId: command.event.deviceId,
      alarmType: normalizedAlarmType,
      data: command.event.data ?? {},
      thresholdSnapshot: command.event.thresholdSnapshot ?? {},
      ts: command.event.ts?.trim() || new Date().toISOString(),
      metadata: command.event.metadata ?? {},
    };

    return this.dataSource.transaction(async (manager) => {
      const alarmRepo = this.alarmRepository.withManager(manager);
      const idempotencyRepo = this.idempotencyRepository.withManager(manager);
      const outboxRepo = this.outboxRepository.withManager(manager);

      const inserted = await idempotencyRepo.createIfAbsent({
        tenantId: command.event.tenantId,
        eventId: normalizedEventId,
        sourceTopic: command.sourceTopic,
        payloadHash,
      });

      if (!inserted) {
        this.logger.debug(
          `Duplicate abnormal event dropped: ${normalizedEventId}`,
        );
        this.logger.log(
          `Abnormal event processing result: deduplicated=true, alarmId=null, tenantId=${normalizedEvent.tenantId}, deviceId=${normalizedEvent.deviceId}, eventId=${normalizedEventId}`,
        );
        return {
          deduplicated: true,
        };
      }

      const existingOpenAlarm = await alarmRepo.findOpenAlarm(
        command.event.tenantId,
        command.event.deviceId,
        normalizedAlarmType,
      );

      const alarm = existingOpenAlarm ?? new Alarm();
      alarm.tenantId = normalizedEvent.tenantId;
      alarm.deviceId = normalizedEvent.deviceId;
      alarm.alarmType = normalizedAlarmType;
      alarm.lastEventId = normalizedEventId;
      alarm.currentValue = normalizedEvent.data;
      alarm.thresholdSnapshot = normalizedEvent.thresholdSnapshot;
      alarm.status = this.alarmFsmService.nextOnAbnormal(
        existingOpenAlarm?.status,
      );

      if (!existingOpenAlarm) {
        alarm.acknowledgedAt = undefined;
        alarm.acknowledgedBy = undefined;
        alarm.resolvedAt = undefined;
        alarm.suppressed = false;
      }

      const savedAlarm = await alarmRepo.save(alarm);

      const outboxEvent = new OutboxEvent();
      outboxEvent.tenantId = command.event.tenantId;
      outboxEvent.aggregateType = 'alarm';
      outboxEvent.aggregateId = savedAlarm.id;
      outboxEvent.subscriberType = 'UNASSIGNED';
      outboxEvent.status = OutboxStatus.PENDING;
      outboxEvent.payload = {
        schemaVersion: 1,
        event: normalizedEvent,
      };

      await outboxRepo.save(outboxEvent);

      const idempotencyRow = await idempotencyRepo.findByTenantAndEvent(
        command.event.tenantId,
        normalizedEventId,
      );

      if (idempotencyRow) {
        await idempotencyRepo.markProcessed(idempotencyRow.id);
      }

      this.logger.log(
        `Abnormal event processing result: deduplicated=false, alarmId=${savedAlarm.id}, tenantId=${normalizedEvent.tenantId}, deviceId=${normalizedEvent.deviceId}, eventId=${normalizedEventId}`,
      );

      return {
        deduplicated: false,
        alarmId: savedAlarm.id,
      };
    });
  }
}
