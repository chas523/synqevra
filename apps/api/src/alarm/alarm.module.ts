import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IdempotencyModule } from '../idempotency/idempotency.module';
import { OutboxModule } from '../outbox/outbox.module';

import { ProcessAbnormalEventCommandHandler } from './application/commands/process-abnormal-event/process-abnormal-event.command-handler';
import { AlarmRepository } from './domain/repositories/alarm.repository';
import { AlarmFsmService } from './domain/services/alarm-fsm.service';
import { ALARM_QUEUE_NAMES } from './infrastructure/constants/queue.constants';
import { AlarmRepositoryAdapter } from './infrastructure/persistence/alarm.repository.adapter';
import { Alarm } from './infrastructure/persistence/alarm.entity';
import { AbnormalIngestProcessor } from './infrastructure/queues/abnormal-ingest.processor';
import { AlarmIngestConsumer } from './interface/mqtt/alarm-ingest.consumer';
import { AlarmIngestController } from './interface/rest/alarm-ingest.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: ALARM_QUEUE_NAMES.ABNORMAL_INGEST,
    }),
    CqrsModule,
    TypeOrmModule.forFeature([Alarm]),
    IdempotencyModule,
    OutboxModule,
  ],
  providers: [
    AlarmFsmService,
    AlarmIngestConsumer,
    AbnormalIngestProcessor,
    ProcessAbnormalEventCommandHandler,
    {
      provide: AlarmRepository,
      useClass: AlarmRepositoryAdapter,
    },
  ],
  exports: [AlarmRepository],
  controllers: [AlarmIngestController],
})
export class AlarmModule {}
