import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePendingUserCommand } from './update-pending-user.command';
import { Inject } from '@nestjs/common';
import {
  PENDING_USER_REPOSITORY_PORT,
  PendingUserRepositoryPort,
} from '../../ports/pending-user.repository.port';
import { Err, Ok, Result } from 'oxide.ts';
import { UserNotFoundError } from 'src/pending-user/domain/errors/pending-user.errors';
import { PendingUserModel } from 'src/pending-user/domain/models/pending-user.model';

@CommandHandler(UpdatePendingUserCommand)
export class UpdatePendingUserCommandHandler implements ICommandHandler<
  UpdatePendingUserCommand,
  Result<PendingUserModel, UserNotFoundError>
> {
  constructor(
    @Inject(PENDING_USER_REPOSITORY_PORT)
    private readonly pendingUserRepository: PendingUserRepositoryPort,
  ) {}

  async execute(
    command: UpdatePendingUserCommand,
  ): Promise<Result<PendingUserModel, UserNotFoundError>> {
    const { id, activationToken, expiresAt, status } = command;
    const existingUser = await this.pendingUserRepository.findById(id);
    if (!existingUser) {
      return Err(new UserNotFoundError());
    }

    if (activationToken && expiresAt) {
      existingUser.setActivationToken(activationToken, expiresAt);
    }

    if (status) {
      existingUser.setStatus(status);
    }
    await this.pendingUserRepository.update(existingUser);

    return Ok(existingUser);
  }
}
