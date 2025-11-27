import { ConnectionModel } from '../entities/connection.model';

export abstract class ConnectionRepository {
  abstract create(userId: number): ConnectionModel | null;
  abstract save(model: ConnectionModel): Promise<ConnectionModel | null>;
  abstract getConnectionByUserId(
    userId: number,
  ): Promise<ConnectionModel | null>;
}
