import { EntityManager } from 'typeorm';

import { OutboxStatus } from '../enums/outbox-status.enum';
import { OutboxEvent } from '../../infrastructure/persistence/outbox-event.entity';

export abstract class OutboxRepository {
  abstract withManager(manager: EntityManager): OutboxRepository;

  abstract save(event: OutboxEvent): Promise<OutboxEvent>;

  abstract lockDueBatch(limit: number): Promise<OutboxEvent[]>;

  abstract updateDispatchState(params: {
    id: string;
    status: OutboxStatus;
    attempts: number;
    nextAttemptAt?: Date;
    deliveredAt?: Date;
    lastError?: string;
  }): Promise<void>;

  abstract findById(id: string): Promise<OutboxEvent | null>;
}
