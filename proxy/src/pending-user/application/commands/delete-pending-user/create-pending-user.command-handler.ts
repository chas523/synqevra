import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Inject } from '@nestjs/common';
import {
  PENDING_USER_REPOSITORY_PORT,
  PendingUserRepositoryPort,
} from '../../ports/pending-user.repository.port';

import { Err, Ok, Result } from 'oxide.ts';
import { DeletePendingUserCommand } from './delete-pending-user.command';
import { UserNotFoundError } from 'src/pending-user/domain/errors/pending-user.errors';

@CommandHandler(DeletePendingUserCommand)
export class DeletePendingUserCommandHandler
  implements
    ICommandHandler<DeletePendingUserCommand, Result<void, UserNotFoundError>>
{
  constructor(
    @Inject(PENDING_USER_REPOSITORY_PORT)
    private readonly pendingUserRepository: PendingUserRepositoryPort,
  ) {}

  async execute(
    command: DeletePendingUserCommand,
  ): Promise<Result<void, UserNotFoundError>> {
    const { id } = command;

    const deleted = await this.pendingUserRepository.delete(id);
    if (!deleted) {
      return Err(new UserNotFoundError());
    }
    return Ok(undefined);
  }
}
