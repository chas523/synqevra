import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { QueryFailedError } from 'typeorm';

import { IdempotencyRepository } from '../../domain/repositories/idempotency.repository';

import { IdempotencyKey } from './idempotency-key.entity';

@Injectable()
export class IdempotencyRepositoryAdapter extends IdempotencyRepository {
  constructor(
    @InjectRepository(IdempotencyKey)
    private readonly repository: Repository<IdempotencyKey>,
  ) {
    super();
  }

  withManager(manager: EntityManager): IdempotencyRepository {
    return new IdempotencyRepositoryAdapter(
      manager.getRepository(IdempotencyKey),
    );
  }

  async createIfAbsent(params: {
    tenantId: string;
    eventId: string;
    sourceTopic?: string;
    payloadHash?: string;
  }): Promise<boolean> {
    try {
      await this.repository.insert({
        tenantId: params.tenantId,
        eventId: params.eventId,
        sourceTopic: params.sourceTopic,
        payloadHash: params.payloadHash,
      });
      return true;
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & { driverError?: { code?: string } })
          .driverError?.code === '23505'
      ) {
        return false;
      }

      throw error;
    }
  }

  async markProcessed(idempotencyKeyId: string): Promise<void> {
    await this.repository.update(idempotencyKeyId, {
      processedAt: new Date(),
    });
  }

  async findByTenantAndEvent(
    tenantId: string,
    eventId: string,
  ): Promise<IdempotencyKey | null> {
    return this.repository.findOne({
      where: {
        tenantId,
        eventId,
      },
    });
  }
}
