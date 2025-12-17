import { ThingsboardModel } from 'src/thingsboard/domain/models/thingsboard.model';
import { EntityManager } from 'typeorm';
import { ThingsboardRepositoryAdapter } from '../../infrastructure/persistence/thingsboard.repository.adapter';

export abstract class ThingsboardRepositoryPort {
  abstract save(thingsboard: ThingsboardModel): Promise<ThingsboardModel>;
  abstract findByUserId(userId: number): Promise<ThingsboardModel | null>;
  abstract update(thingsboard: ThingsboardModel): Promise<ThingsboardModel>;
  abstract withManager(manager: EntityManager): ThingsboardRepositoryAdapter;
  abstract getTokens(userId: number): Promise<ThingsboardModel | null>;
}

export const THINGSBOARD_REPOSITORY_PORT = Symbol(
  'THINGSBOARD_REPOSITORY_PORT',
);
