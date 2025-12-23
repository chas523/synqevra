import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { UserNotFoundError } from 'src/pending-user/domain/errors/pending-user.errors';
import { UnitOfWork } from '../../../../connection/infrastructure/transaction/unit-of-work';

export type DeletePendingUserProps = {
  id: number;
  uow: UnitOfWork;
};
export class DeletePendingUserCommand extends Command<
  Result<void, UserNotFoundError>
> {
  public readonly id: number;
  public readonly uow: UnitOfWork;

  constructor(dto: DeletePendingUserProps) {
    super();
    this.id = dto.id;
    this.uow = dto.uow;
  }
}
