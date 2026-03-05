import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Result, Ok, Err } from 'oxide.ts';
import {
  PENDING_USER_REPOSITORY_PORT,
  PendingUserRepositoryPort,
} from '../../ports/pending-user.repository.port';
import { Inject } from '@nestjs/common';
import { GetPendingUserByEmailQuery } from './get-pending-user-by-email.query';
import { UserNotFoundError } from 'src/pending-user/domain/errors/pending-user.errors';
import { PendingUserModel } from 'src/pending-user/domain/models/pending-user.model';

@QueryHandler(GetPendingUserByEmailQuery)
export class GetPendingUserByEmailQueryHandler implements IQueryHandler<
  GetPendingUserByEmailQuery,
  Result<PendingUserModel, UserNotFoundError>
> {
  constructor(
    @Inject(PENDING_USER_REPOSITORY_PORT)
    private readonly pendingUserRepository: PendingUserRepositoryPort,
  ) {}

  async execute(
    query: GetPendingUserByEmailQuery,
  ): Promise<Result<PendingUserModel, UserNotFoundError>> {
    const pendingUser = await this.pendingUserRepository.findByEmail(
      query.email,
    );
    if (!pendingUser) {
      return Err(new UserNotFoundError());
    }
    return Ok(pendingUser);
  }
}
