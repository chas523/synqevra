import { ConnectionModel } from '../entities/connection.model';
import { EntityManager } from 'typeorm';
import { ConnectionRepositoryAdapter } from '../../infrastructure/persistance/connection.repository.adapter';

export abstract class ConnectionRepository {
  abstract withManager(manager: EntityManager): ConnectionRepositoryAdapter;
  abstract create(userId: number): ConnectionModel | null;
  abstract save(model: ConnectionModel): Promise<ConnectionModel | null>;
  abstract getConnectionByUserId(
    userId: number,
  ): Promise<ConnectionModel | null>;
  abstract getOrCreateByUserId(userId: number): Promise<ConnectionModel>;
}
