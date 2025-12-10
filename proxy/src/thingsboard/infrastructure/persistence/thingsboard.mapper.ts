import { ThingsboardModel } from 'src/thingsboard/domain/models/thingsboard.model';
import { Thingsboard } from './thingsboard.entity';

export class ThingsboardMapper {
  static toDomain(entity: Thingsboard): ThingsboardModel {
    return new ThingsboardModel(
      entity.project,
      entity.tenantId,
      entity.id,
      entity.accessToken,
      entity.refreshToken,
      entity.connection,
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
    entity.connection = model.getConnection();

    return entity;
  }
}
