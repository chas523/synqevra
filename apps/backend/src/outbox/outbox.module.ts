import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProxyModule } from '../proxy/proxy.module';
import { ThingsboardModule } from '../thingsboard/thingsboard.module';
import { ThingsboardWsAuthGuard } from '../auth/guards/thingsboard-ws-auth/thingsboard-ws-auth.guard';

import { OutboxDispatcherService } from './application/services/outbox-dispatcher.service';
import { ReplayOutboxEntryUseCase } from './application/use-cases/replay-outbox-entry.use-case';
import { OutboxRepository } from './domain/repositories/outbox.repository';
import { OutboxEvent } from './infrastructure/persistence/outbox-event.entity';
import { OutboxRepositoryAdapter } from './infrastructure/persistence/outbox.repository.adapter';
import { OutboxController } from './interface/rest/outbox.controller';
import { MedplumAlarmSubscriberAdapter } from './infrastructure/subscribers/medplum/medplum-alarm-subscriber.adapter';
import { WebAppAlarmSubscriberAdapter } from './infrastructure/subscribers/web-app/web-app-alarm-subscriber.adapter';
import { AlarmGateway } from './interface/websocket/alarm.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([OutboxEvent]),
    ProxyModule,
    ThingsboardModule,
    CqrsModule,
  ],
  providers: [
    OutboxDispatcherService,
    ReplayOutboxEntryUseCase,
    MedplumAlarmSubscriberAdapter,
    WebAppAlarmSubscriberAdapter,
    AlarmGateway,
    ThingsboardWsAuthGuard,
    {
      provide: OutboxRepository,
      useClass: OutboxRepositoryAdapter,
    },
  ],
  exports: [OutboxRepository, OutboxDispatcherService],
  controllers: [OutboxController],
})
export class OutboxModule {}
