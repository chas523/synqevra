export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
  status?: "new" | "pending";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextCursor?: string;
    prevCursor?: string;
  };
  total: number;
}
export interface PendingUser extends User {
  status?: "new" | "pending";
}

export interface RequestedAccessUsersRequestOptions {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: "new" | "pending";
  limit?: number;
  afterRef?: string;
  beforeRef?: string;
  [key: string]: unknown;
}

export interface ActiveUsersRequestOptions {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  afterRef?: string;
  beforeRef?: string;
  [key: string]: unknown;
}

export interface MailRecipient {
  firstName: string;
  lastName: string;
  email: string;
}
