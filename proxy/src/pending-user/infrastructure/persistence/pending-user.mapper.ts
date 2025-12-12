import { PendingUserModel } from '../../domain/models/pending-user.model';
import { EmailAddress } from '../../domain/value-objects/email-address.vo';
import { PendingUser } from './pending-user.entity';

export class PendingUserMapper {
  static toDomain(ormEntity: PendingUser): PendingUserModel {
    return new PendingUserModel(
      ormEntity.firstName,
      ormEntity.lastName,
      new EmailAddress(ormEntity.email), // string → Value Object
      ormEntity.status,
      ormEntity.id,
      ormEntity.createdAt,
      ormEntity.activationToken,
      ormEntity.expiresAt,
    );
  }

  static toOrm(domainEntity: PendingUserModel): PendingUser {
    const ormEntity = new PendingUser();
    if (domainEntity.isPersisted()) {
      ormEntity.id = domainEntity.getId();
    }
    ormEntity.firstName = domainEntity.getFirstName();
    ormEntity.lastName = domainEntity.getLastName();
    ormEntity.email = domainEntity.getEmail().getValue(); // Value Object → string
    ormEntity.status = domainEntity.getStatus();
    ormEntity.createdAt = domainEntity.getCreatedAt();
    ormEntity.activationToken = domainEntity.getActivationToken();
    ormEntity.expiresAt = domainEntity.getExpiresAt();
    return ormEntity;
  }
}
