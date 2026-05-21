import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

import { OutboxStatus } from '../../domain/enums/outbox-status.enum';
import { OutboxRepository } from '../../domain/repositories/outbox.repository';
import { SubscriberType } from '../../domain/subscribers/subscriber-type.enum';
import { OutboxEvent } from '../../infrastructure/persistence/outbox-event.entity';
import { MedplumAlarmSubscriberAdapter } from '../../infrastructure/subscribers/medplum/medplum-alarm-subscriber.adapter';

import { OUTBOX_SETTINGS } from '../constants/outbox.constants';

@Injectable()
export class OutboxDispatcherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxDispatcherService.name);
  private intervalRef?: NodeJS.Timeout;

  constructor(
    private readonly dataSource: DataSource,
    private readonly outboxRepository: OutboxRepository,
    private readonly medplumSubscriber: MedplumAlarmSubscriberAdapter,
  ) {}

  onModuleInit(): void {
    if (process.env.OUTBOX_DISPATCHER_ENABLED !== 'true') {
      this.logger.log('Outbox dispatcher is disabled by configuration.');
      return;
    }

    this.intervalRef = setInterval(() => {
      void this.dispatchTick();
    }, OUTBOX_SETTINGS.TICK_MS);

    this.logger.log('Outbox dispatcher started.');
  }

  onModuleDestroy(): void {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
    }
  }

  async dispatchTick(): Promise<void> {
    try {
      await this.dataSource.transaction(async (manager) => {
        const outboxRepo = this.outboxRepository.withManager(manager);
        const dueRows = await outboxRepo.lockDueBatch(
          OUTBOX_SETTINGS.DISPATCH_BATCH_SIZE,
        );

        for (const row of dueRows) {
          await this.processRow(outboxRepo, row);
        }
      });
    } catch (error) {
      this.logger.error('Outbox dispatch tick failed', error);
    }
  }

  private async processRow(
    outboxRepo: OutboxRepository,
    row: OutboxEvent,
  ): Promise<void> {
    try {
      await this.dispatchToSubscriber(row);

      await outboxRepo.updateDispatchState({
        id: row.id,
        attempts: row.attempts,
        status: OutboxStatus.DELIVERED,
        deliveredAt: new Date(),
      });

      this.logger.log(
        `Outbox delivery succeeded: outboxId=${row.id}, subscriberType=${row.subscriberType}, attempts=${row.attempts}`,
      );

      return;
    } catch (error) {
      const attempts = row.attempts + 1;
      const maxAttempts = OUTBOX_SETTINGS.MAX_RETRY_ATTEMPTS;

      if (attempts >= maxAttempts) {
        await outboxRepo.updateDispatchState({
          id: row.id,
          attempts,
          status: OutboxStatus.DEAD,
          lastError: this.stringifyError(error),
        });

        this.logger.error(
          `Outbox delivery moved to DEAD: outboxId=${row.id}, subscriberType=${row.subscriberType}, attempts=${attempts}`,
          error,
        );
        return;
      }

      const delayMs = OUTBOX_SETTINGS.RETRY_BASE_DELAY_MS * 2 ** (attempts - 1);
      const nextAttemptAt = new Date(Date.now() + delayMs);

      await outboxRepo.updateDispatchState({
        id: row.id,
        attempts,
        status: OutboxStatus.RETRY,
        nextAttemptAt,
        lastError: this.stringifyError(error),
      });

      this.logger.warn(
        `Outbox delivery scheduled for retry: outboxId=${row.id}, subscriberType=${row.subscriberType}, attempts=${attempts}, nextAttemptAt=${nextAttemptAt.toISOString()}`,
      );
    }
  }

  private async dispatchToSubscriber(row: OutboxEvent): Promise<void> {
    switch (row.subscriberType) {
      case SubscriberType.MEDPLUM:
        await this.medplumSubscriber.deliver(row);
        return;
      default:
        throw new Error(`Unsupported subscriber type: ${row.subscriberType}`);
    }
  }

  private stringifyError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown outbox subscriber error';
  }
}
