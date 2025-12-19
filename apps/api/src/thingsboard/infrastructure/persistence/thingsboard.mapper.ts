import { ThingsboardModel } from 'src/thingsboard/domain/models/thingsboard.model';
import { Thingsboard } from './thingsboard.entity';
import { Connection } from '../../../connection/infrastructure/persistance/connection.entity';

export class ThingsboardMapper {
  static toDomain(entity: Thingsboard): ThingsboardModel {
    return new ThingsboardModel(
      entity.project,
      entity.tenantId,
      entity.id,
      entity.accessToken,
      entity.refreshToken,
      entity.connection.id,
    );
  }

  static toOrm(model: ThingsboardModel): Thingsboard {
    const entity = new Thingsboard();
    if (model.isPersisted()) {
      entity.id = model.getId();
    }
    entity.project = model.getProject();
    entity.tenantId = model.getTenantId();
    entity.accessToken = model.getAccessToken();
    entity.refreshToken = model.getRefreshToken();
    if (model.getConnection()) {
      entity.connection = { id: model.getConnection() } as Connection;
    }

    return entity;
  }
}
