import { Admin } from './admin.entity';
import { AdminModel } from '../../domain/entities/admin.model';

export class AdminMapper {
  static toDomain(entity: Admin): AdminModel {
    return {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      password: entity.password,
      hashedRt: entity.hashedRt,
      role: entity.role,
    };
  }

  static toOrm(model: AdminModel): Admin {
    const entity = new Admin();

    if (model.id !== undefined) {
      entity.id = model.id;
    }
    entity.firstName = model.firstName;
    entity.lastName = model.lastName;
    entity.email = model.email;
    entity.password = model.password;
    entity.hashedRt = model.hashedRt ?? null;
    entity.role = model.role;

    return entity;
  }
}
