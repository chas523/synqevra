import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePendingUserCommand } from './create-pending-user.command';

import { Inject } from '@nestjs/common';
import {
  PENDING_USER_REPOSITORY_PORT,
  PendingUserRepositoryPort,
} from '../../ports/pending-user.repository.port';

import { Err, Ok, Result } from 'oxide.ts';
import { UserAlreadyExistsError } from 'src/pending-user/domain/errors/pending-user.errors';
import { PendingUserModel } from 'src/pending-user/domain/models/pending-user.model';
import { EmailAddress } from 'src/pending-user/domain/value-objects/email-address.vo';

@CommandHandler(CreatePendingUserCommand)
export class CreatePendingUserCommandHandler
  implements
    ICommandHandler<
      CreatePendingUserCommand,
      Result<PendingUserModel, UserAlreadyExistsError>
    >
{
  constructor(
    @Inject(PENDING_USER_REPOSITORY_PORT)
    private readonly pendingUserRepository: PendingUserRepositoryPort,
  ) {}

  async execute(
    command: CreatePendingUserCommand,
  ): Promise<Result<PendingUserModel, UserAlreadyExistsError>> {
    const { firstName, lastName, email } = command;

    const existingUser = await this.pendingUserRepository.findByEmail(email);
    if (existingUser) {
      return Err(new UserAlreadyExistsError());
    }

    const emailVo = new EmailAddress(email);
    const pendingUser = PendingUserModel.create(firstName, lastName, emailVo);
    const newPendingUser = await this.pendingUserRepository.save(pendingUser);

    return Ok(newPendingUser);
  }
}
