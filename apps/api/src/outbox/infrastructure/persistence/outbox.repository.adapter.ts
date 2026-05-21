import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';

import { OutboxStatus } from '../../domain/enums/outbox-status.enum';
import { OutboxRepository } from '../../domain/repositories/outbox.repository';

import { OutboxEvent } from './outbox-event.entity';

@Injectable()
export class OutboxRepositoryAdapter extends OutboxRepository {
  constructor(
    @InjectRepository(OutboxEvent)
    private readonly repository: Repository<OutboxEvent>,
  ) {
    super();
  }

  withManager(manager: EntityManager): OutboxRepository {
    return new OutboxRepositoryAdapter(manager.getRepository(OutboxEvent));
  }

  async save(event: OutboxEvent): Promise<OutboxEvent> {
    return this.repository.save(event);
  }

  async lockDueBatch(limit: number): Promise<OutboxEvent[]> {
    return this.repository
      .createQueryBuilder('outbox')
      .where('outbox.status IN (:...statuses)', {
        statuses: [OutboxStatus.PENDING, OutboxStatus.RETRY],
      })
      .andWhere('outbox.nextAttemptAt <= :now', { now: new Date() })
      .orderBy('outbox.nextAttemptAt', 'ASC')
      .limit(limit)
      .setLock('pessimistic_write')
      .setOnLocked('skip_locked')
      .getMany();
  }

  async updateDispatchState(params: {
    id: string;
    status: OutboxStatus;
    attempts: number;
    nextAttemptAt?: Date;
    deliveredAt?: Date;
    lastError?: string;
  }): Promise<void> {
    await this.repository.update(params.id, {
      status: params.status,
      attempts: params.attempts,
      nextAttemptAt: params.nextAttemptAt,
      deliveredAt: params.deliveredAt,
      lastError: params.lastError,
    });
  }

  async findById(id: string): Promise<OutboxEvent | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByAggregate(params: {
    tenantId: string;
    aggregateType: string;
    aggregateId: string;
    subscriberType?: string;
    limit: number;
  }): Promise<OutboxEvent[]> {
    const query = this.repository
      .createQueryBuilder('outbox')
      .where('outbox.tenantId = :tenantId', { tenantId: params.tenantId })
      .andWhere('outbox.aggregateType = :aggregateType', {
        aggregateType: params.aggregateType,
      })
      .andWhere('outbox.aggregateId = :aggregateId', {
        aggregateId: params.aggregateId,
      })
      .orderBy('outbox.createdAt', 'DESC')
      .limit(params.limit);

    if (params.subscriberType) {
      query.andWhere('outbox.subscriberType = :subscriberType', {
        subscriberType: params.subscriberType,
      });
    }

    return query.getMany();
  }
}
