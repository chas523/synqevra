import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OutboxDispatcherService } from './application/services/outbox-dispatcher.service';
import { ReplayOutboxEntryUseCase } from './application/use-cases/replay-outbox-entry.use-case';
import { OutboxRepository } from './domain/repositories/outbox.repository';
import { OutboxEvent } from './infrastructure/persistence/outbox-event.entity';
import { OutboxRepositoryAdapter } from './infrastructure/persistence/outbox.repository.adapter';
import { OutboxController } from './interface/rest/outbox.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OutboxEvent])],
  providers: [
    OutboxDispatcherService,
    ReplayOutboxEntryUseCase,
    {
      provide: OutboxRepository,
      useClass: OutboxRepositoryAdapter,
    },
  ],
  exports: [OutboxRepository, OutboxDispatcherService],
  controllers: [OutboxController],
})
export class OutboxModule {}
