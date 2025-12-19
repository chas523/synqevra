import { User } from './user.entity';
import { UserModel } from '../../domain/entities/user.model';
import { Role } from '../../domain/enums/role.enum';
import { Connection } from '../../../connection/infrastructure/persistance/connection.entity';

export class UserMapper {
  static toDomain(entity: User): UserModel {
    return {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      password: entity.password,
      hashedRt: entity.hashedRt,
      role: entity.role,
      connectionId: entity.connection?.id,
    };
  }

  static toOrm(model: UserModel): User {
    const entity = new User();

    if (model.id !== undefined) {
      entity.id = model.id;
    }
    entity.firstName = model.firstName;
    entity.lastName = model.lastName;
    entity.email = model.email;
    entity.password = model.password;
    entity.hashedRt = model.hashedRt ?? null;
    entity.role = model.role ?? Role.USER;

    if (model.connectionId) {
      entity.connection = { id: model.connectionId } as Connection;
    }

    return entity;
  }
}
