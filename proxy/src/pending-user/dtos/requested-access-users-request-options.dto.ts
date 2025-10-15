import { PendingUserStatus } from 'src/entities/pending-user.entity';

export interface RequestedAccessUsersRequestOptions {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status: PendingUserStatus;
  limit?: number;
  afterRef?: string;
  beforeRef?: string;
  [key: string]: unknown;
}
