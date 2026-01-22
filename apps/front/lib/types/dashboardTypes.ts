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

export interface EntityId {
  entityType: string;
  id: string;
}

export interface Tenant {
  id: {
    entityType: string;
    id: string;
  };
  createdTime?: number;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  address2?: string;
  zip?: string;
  phone?: string;
  email?: string;
  title: string;
  region?: string;
  tenantProfileId: {
    id: {
      entityType: string;
      id: string;
    };
    name: string;
  };
  version?: number;
  name: string;
  // biome-ignore lint/suspicious/noExplicitAny: <>
  additionalInfo?: Record<string, any>;
}

export interface TenantsRequestOptions extends Record<string, unknown> {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  page?: number;
  afterRef?: string;
  beforeRef?: string;
}

export interface TenantUser {
  id: EntityId;
  createdTime: number;
  tenantId: EntityId;
  customerId?: EntityId;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  version?: number;
  name?: string;
  authority: string;
  // biome-ignore lint/suspicious/noExplicitAny: <>
  additionalInfo?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeviceData extends Record<string, unknown> {
  id: EntityId;
  createdTime: number;
  tenantId: EntityId;
  customerId?: EntityId;
  name: string;
  type: string;
  label?: string | null;
  version?: number;
  deviceProfileName?: string;
  active?: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: <>
  additionalInfo?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}
