import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { UserNotFoundError } from 'src/pending-user/domain/errors/pending-user.errors';
import { PendingUserModel } from 'src/pending-user/domain/models/pending-user.model';

export type GetPendingUserByEmail = {
  email: string;
};
export class GetPendingUserByEmailQuery extends Command<
  Result<PendingUserModel, UserNotFoundError>
> {
  public readonly email: string;

  constructor(dto: GetPendingUserByEmail) {
    super();
    this.email = dto.email;
  }
}
