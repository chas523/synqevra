import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { PendingUserStatus } from 'src/pending-user/domain/enums/status.enum';
import { DisallowedSortFieldsError } from 'src/pending-user/domain/errors/pagination.errors';
import { UserNotFoundError } from 'src/pending-user/domain/errors/pending-user.errors';
import { PendingUserModel } from 'src/pending-user/domain/models/pending-user.model';
import { PaginatedResponse } from 'src/pending-user/interface/rest/dtos/paginated-response.dto';

export type RequestedAccessUsersRequestOptions = {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: PendingUserStatus;
  limit?: number;
  afterRef?: string;
  beforeRef?: string;
  [key: string]: unknown;
};

export type PaginationQueryErrors =
  | UserNotFoundError
  | DisallowedSortFieldsError;

export class GetPendingUserListPaginatedQuery extends Command<
  Result<PaginatedResponse<PendingUserModel>, PaginationQueryErrors>
> {
  public readonly options: RequestedAccessUsersRequestOptions;

  constructor(options: RequestedAccessUsersRequestOptions) {
    super();
    this.options = options;
  }
}
