import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Result, Ok, Err } from 'oxide.ts';
import {
  PENDING_USER_REPOSITORY_PORT,
  PendingUserRepositoryPort,
} from '../../ports/pending-user.repository.port';
import { Inject } from '@nestjs/common';
import { GetPendingUserByIdQuery } from './get-pending-user-by-id.query';
import { UserNotFoundError } from 'src/pending-user/domain/errors/pending-user.errors';
import { PendingUserModel } from 'src/pending-user/domain/models/pending-user.model';

@QueryHandler(GetPendingUserByIdQuery)
export class GetPendingUserByIdQueryHandler implements IQueryHandler<
  GetPendingUserByIdQuery,
  Result<PendingUserModel, UserNotFoundError>
> {
  constructor(
    @Inject(PENDING_USER_REPOSITORY_PORT)
    private readonly pendingUserRepository: PendingUserRepositoryPort,
  ) {}

  async execute(
    query: GetPendingUserByIdQuery,
  ): Promise<Result<PendingUserModel, UserNotFoundError>> {
    const pendingUser = await this.pendingUserRepository.findById(query.id);
    if (!pendingUser) {
      return Err(new UserNotFoundError());
    }
    return Ok(pendingUser);
  }
}
