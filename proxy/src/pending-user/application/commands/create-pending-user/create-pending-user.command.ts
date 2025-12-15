import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { UserAlreadyExistsError } from 'src/pending-user/domain/errors/pending-user.errors';
import { PendingUserModel } from 'src/pending-user/domain/models/pending-user.model';

export type CreatePendingUserProps = {
  firstName: string;
  lastName: string;
  email: string;
};
export class CreatePendingUserCommand extends Command<
  Result<PendingUserModel, UserAlreadyExistsError>
> {
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly email: string;

  constructor(dto: CreatePendingUserProps) {
    super();
    this.firstName = dto.firstName;
    this.lastName = dto.lastName;
    this.email = dto.email;
  }
}
