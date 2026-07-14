import { EntityManager } from 'typeorm';
import { ActivationLink } from '../../infrastructure/persistence/activation-link.entity';
import { ActivationLinkRepositoryAdapter } from 'src/iam/infrastructure/persistence/activation-link.repository.adapter';

export abstract class ActivationLinkRepository {
  abstract save(data: {
    token: string;
    userId: number;
    tenantId: string;
    expiresAt: Date | null;
  }): Promise<ActivationLink>;

  abstract findByToken(token: string): Promise<ActivationLink | null>;

  abstract findByUserId(userId: number): Promise<ActivationLink | null>;

  abstract delete(id: number): Promise<void>;

  abstract deleteByUserId(userId: number): Promise<void>;
  abstract withManager(manager: EntityManager): ActivationLinkRepositoryAdapter;
}
