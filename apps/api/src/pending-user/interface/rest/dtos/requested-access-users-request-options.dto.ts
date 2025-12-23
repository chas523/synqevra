import { PendingUserStatus } from 'src/pending-user/domain/enums/status.enum';

export interface RequestedAccessUsersRequestOptions {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: PendingUserStatus;
  limit?: number;
  afterRef?: string;
  beforeRef?: string;
  [key: string]: unknown;
}
