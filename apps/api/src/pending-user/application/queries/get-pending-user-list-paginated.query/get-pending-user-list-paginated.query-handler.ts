import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Result, Ok, Err } from 'oxide.ts';
import {
  PENDING_USER_REPOSITORY_PORT,
  PendingUserRepositoryPort,
  PaginationCursorPrimitive,
  PaginationPrimitiveSortBy,
} from '../../ports/pending-user.repository.port';
import { Inject, BadRequestException } from '@nestjs/common';

import {
  GetPendingUserListPaginatedQuery,
  PaginationQueryErrors,
  RequestedAccessUsersRequestOptions,
} from './get-pending-user-list-paginated.query';
import {
  DisallowedSortFieldsError,
  CursorCodingError,
} from 'src/pending-user/domain/errors/pagination.errors';
import { UserNotFoundError } from 'src/pending-user/domain/errors/pending-user.errors';
import { PendingUserModel } from 'src/pending-user/domain/models/pending-user.model';
import { PaginatedResponse } from 'src/pending-user/interface/rest/dtos/paginated-response.dto';

@QueryHandler(GetPendingUserListPaginatedQuery)
export class GetPendingUserListPaginatedQueryHandler implements IQueryHandler<
  GetPendingUserListPaginatedQuery,
  Result<PaginatedResponse<PendingUserModel>, PaginationQueryErrors>
> {
  constructor(
    @Inject(PENDING_USER_REPOSITORY_PORT)
    private readonly pendingUserRepository: PendingUserRepositoryPort,
  ) {}

  async execute(
    query: GetPendingUserListPaginatedQuery,
  ): Promise<
    Result<PaginatedResponse<PendingUserModel>, PaginationQueryErrors>
  > {
    try {
      const pendingUsers = await this.getPendingUserListPaginated(
        query.options,
      );
      return Ok(pendingUsers);
    } catch (error) {
      if (error instanceof DisallowedSortFieldsError) {
        return Err(error);
      }
      return Err(new UserNotFoundError());
    }
  }

  //there's still some unknown behaviour while sorting via date. i cannot resolve the issue, maybe the date formats are wrongly compared
  async getPendingUserListPaginated(
    options: RequestedAccessUsersRequestOptions,
  ): Promise<PaginatedResponse<PendingUserModel>> {
    const {
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      limit = 10,
      afterRef,
      beforeRef,
    } = options;

    const allowedSortFields: PaginationPrimitiveSortBy[] = [
      'createdAt',
      'email',
    ];
    if (!allowedSortFields.includes(sortBy as PaginationPrimitiveSortBy)) {
      throw new DisallowedSortFieldsError(`Invalid sortBy field: ${sortBy}`);
    }
    const after: PaginationCursorPrimitive | null = afterRef
      ? this.decodeCursor(afterRef)
      : null;
    const before: PaginationCursorPrimitive | null = beforeRef
      ? this.decodeCursor(beforeRef)
      : null;

    const { items, hasMore, total } =
      await this.pendingUserRepository.findForPagination(
        status,
        sortBy as PaginationPrimitiveSortBy,
        sortOrder,
        after,
        before,
        Number(limit),
      );

    let hasNext = false;
    let hasPrev = false;
    let nextCursor: string | undefined;
    let prevCursor: string | undefined;

    if (items.length > 0) {
      const firstItem = items[0];
      const lastItem = items[items.length - 1];

      //code data
      if (!beforeRef && !afterRef) {
        hasNext = hasMore;
        hasPrev = false;
        if (hasNext) {
          nextCursor = this.encodeCursor(lastItem, sortBy);
        }
      } else if (afterRef && !beforeRef) {
        hasNext = hasMore;
        hasPrev = true;
        if (hasNext) {
          nextCursor = this.encodeCursor(lastItem, sortBy);
        }
        prevCursor = this.encodeCursor(firstItem, sortBy);
      } else if (beforeRef && !afterRef) {
        hasPrev = hasMore;
        hasNext = true;
        if (hasPrev) {
          prevCursor = this.encodeCursor(firstItem, sortBy);
        }
        nextCursor = this.encodeCursor(lastItem, sortBy);
      }
    }

    return {
      data: items,
      pagination: {
        limit,
        hasNext,
        hasPrev,
        nextCursor,
        prevCursor,
      },
      total,
    };
  }

  private encodeCursor(item: PendingUserModel, sortBy: string): string {
    const cursorData = {
      id: item.getId(),
      value:
        sortBy === 'createdAt'
          ? item.getCreatedAt().toISOString()
          : item.getEmail().getValue(),
    };
    return JSON.stringify(cursorData);
  }

  private decodeCursor(cursor: string): PaginationCursorPrimitive {
    try {
      const decoded = JSON.parse(cursor) as {
        id: number;
        value: string;
      };
      return {
        id: decoded.id,
        value: decoded.value,
      };
    } catch {
      throw new CursorCodingError();
    }
  }
}
