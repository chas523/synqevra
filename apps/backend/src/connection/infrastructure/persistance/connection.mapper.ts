import { ConnectionModel } from '../../domain/entities/connection.model';
import { Connection } from './connection.entity';
import { User } from '../../../iam/infrastructure/persistence/user.entity';
import { Medplum } from '../../../medplum/infrastructure/persistence/medplum.entity';
import { Thingsboard } from '../../../thingsboard/infrastructure/persistence/thingsboard.entity';

export class ConnectionMapper {
  static toDomain(entity: Connection): ConnectionModel {
    return {
      id: entity.id,
      userId: entity.user.id,
      medplumId: entity.medplum?.id,
      thingsboardId: entity.thingsboard?.id,
      role: entity.role,
    };
  }

  static toOrm(model: ConnectionModel): Connection {
    const entity = new Connection();

    if (model.id !== undefined) {
      entity.id = model.id;
    }
    entity.user = { id: model.userId } as User;

    if (model.medplumId !== undefined) {
      entity.medplum = { id: model.medplumId } as Medplum;
    } else entity.medplum = null;

    if (model.thingsboardId !== undefined) {
      entity.thingsboard = { id: model.thingsboardId } as Thingsboard;
    } else entity.thingsboard = null;

    if (model.role !== undefined) {
      entity.role = model.role;
    }

    return entity;
  }
}
