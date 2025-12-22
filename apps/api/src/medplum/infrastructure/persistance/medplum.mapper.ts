import { Medplum } from './medplum.entity';
import { MedplumModel } from '../../domain/entities/medplum.model';
import { Connection } from '../../../connection/infrastructure/persistance/connection.entity';

export class MedplumMapper {
  static toDomain(entity: Medplum): MedplumModel {
    return {
      id: entity.id,
      client_id: entity.client_id,
      client_secret: entity.client_secret,
      connectionId: entity.connection?.id,
    };
  }

  static toOrm(model: MedplumModel): Medplum {
    const entity = new Medplum();

    if (model.id !== undefined) {
      entity.id = model.id;
    }
    entity.client_id = model.client_id;
    entity.client_secret = model.client_secret;
    if (model.connectionId) {
      entity.connection = { id: model.connectionId } as Connection;
    }

    return entity;
  }
}
