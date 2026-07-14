import { User } from './user.entity';
import { UserModel } from '../../domain/entities/user.model';
import { Connection } from '../../../connection/infrastructure/persistence/connection.entity';

export class UserMapper {
  static toDomain(entity: User): UserModel {
    return {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      password: entity.password,
      hashedRt: entity.hashedRt,
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
    if (model.password) {
      entity.password = model.password;
    }
    entity.hashedRt = model.hashedRt ?? null;

    if (model.connectionId) {
      entity.connection = { id: model.connectionId } as Connection;
    }

    return entity;
  }
}
