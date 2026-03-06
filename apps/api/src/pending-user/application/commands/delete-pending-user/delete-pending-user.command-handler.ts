import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Err, Ok, Result } from 'oxide.ts';
import { DeletePendingUserCommand } from './delete-pending-user.command';
import { UserNotFoundError } from 'src/pending-user/domain/errors/pending-user.errors';

@CommandHandler(DeletePendingUserCommand)
export class DeletePendingUserCommandHandler implements ICommandHandler<
  DeletePendingUserCommand,
  Result<void, UserNotFoundError>
> {
  async execute(
    command: DeletePendingUserCommand,
  ): Promise<Result<void, UserNotFoundError>> {
    const { id, uow } = command;

    const deleted = await uow.pendingUserRepository.delete(id);
    if (!deleted) {
      return Err(new UserNotFoundError());
    }
    return Ok(undefined);
  }
}
