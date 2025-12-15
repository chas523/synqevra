import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { UserNotFoundError } from 'src/pending-user/domain/errors/pending-user.errors';
import { PendingUserModel } from 'src/pending-user/domain/models/pending-user.model';

export type GetPendingUserById = {
  id: number;
};
export class GetPendingUserByIdQuery extends Command<
  Result<PendingUserModel, UserNotFoundError>
> {
  public readonly id: number;

  constructor(dto: GetPendingUserById) {
    super();
    this.id = dto.id;
  }
}
