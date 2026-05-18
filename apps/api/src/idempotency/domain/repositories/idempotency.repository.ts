import { EntityManager } from 'typeorm';

import { IdempotencyKey } from '../../infrastructure/persistence/idempotency-key.entity';

export abstract class IdempotencyRepository {
  abstract withManager(manager: EntityManager): IdempotencyRepository;

  abstract createIfAbsent(params: {
    tenantId: string;
    eventId: string;
    sourceTopic?: string;
    payloadHash?: string;
  }): Promise<boolean>;

  abstract markProcessed(idempotencyKeyId: string): Promise<void>;

  abstract findByTenantAndEvent(
    tenantId: string,
    eventId: string,
  ): Promise<IdempotencyKey | null>;
}
