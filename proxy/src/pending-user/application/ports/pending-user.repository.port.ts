import { PendingUserStatus } from '../../domain/enums/status.enum';
import { PendingUserModel } from '../../domain/models/pending-user.model';

export interface PaginationCursorPrimitive {
  id: number;
  value: string;
}

export type PaginationPrimitiveSortBy = 'createdAt' | 'email';

export abstract class PendingUserRepositoryPort {
  abstract save(pendingUser: PendingUserModel): Promise<PendingUserModel>;
  abstract update(pendingUser: PendingUserModel): Promise<void>;
  abstract findByEmail(email: string): Promise<PendingUserModel | null>;
  abstract findById(id: number): Promise<PendingUserModel | null>;
  abstract findForPagination(
    status: PendingUserStatus | undefined,
    sortBy: PaginationPrimitiveSortBy,
    sortOrder: 'asc' | 'desc',
    after: PaginationCursorPrimitive | null,
    before: PaginationCursorPrimitive | null,
    limit: number,
  ): Promise<{
    items: PendingUserModel[];
    hasMore: boolean;
    total: number;
  }>;
  abstract delete(id: number): Promise<boolean>;
}

export const PENDING_USER_REPOSITORY_PORT = Symbol(
  'PENDING_USER_REPOSITORY_PORT',
);
