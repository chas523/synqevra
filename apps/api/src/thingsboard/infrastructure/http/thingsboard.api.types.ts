export interface EntityId {
  entityType: string;
  id: string;
}

export interface ThingsboardLoginResponse {
  token: string;
  refreshToken: string;
}

export interface TenantProfileId {
  id: EntityId;
  name: string;
}

export interface UserResponse {
  id: {
    entityType: string;
    id: string;
  };
  createdTime: number;
  tenantId: {
    entityType: string;
    id: string;
  };
  customerId: {
    entityType: string;
    id: string;
  };
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  authority: string;
  additionalInfo?: Record<string, any>;
}

export interface Device {
  id: EntityId;
  name: string;
  type: string;
  label: string | null;
  version: number;
  deviceProfileName: string;
  active: boolean;
}

export interface Asset {
  id: EntityId;
  createdTime: number;
  tenantId: EntityId;
  customerId?: EntityId;
  name: string;
  type: string;
  label: string | null;
  assetProfileId: EntityId;
  externalId?: string | null;
  version: number;
  customerTitle: string | null;
  customerIsPublic: boolean;
  assetProfileName: string;
  additionalInfo?: {
    description?: string;
  };
}

export interface AssetProfileInfo {
  id: EntityId;
  tenantId: EntityId;
  name: string;
  image?: string | null;
  defaultDashboardId?: EntityId | null;
}

export interface CustomerInfo {
  id: EntityId;
  createdTime: number;
  title: string;
  tenantId: EntityId;
  additionalInfo?: {
    isPublic?: boolean;
  };
}

// /api/tenants{?pageSize,page,textSearch,sortProperty,sortOrder}
export interface Tenant {
  id: EntityId;
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
  tenantProfileId: TenantProfileId;
  version?: number;
  name: string; // Duplicate of title for compatibility
  additionalInfo?: Record<string, any>;
}

// /api/tenant/{tenantId}/users{?pageSize,page,textSearch,sortProperty,sortOrder}
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
  name?: string; // Duplicates the email of the user
  authority: string;
  additionalInfo?: Record<string, any>;
}

// /api/entitiesQuery/find
export interface EntityQueryFilter {
  type: string; // 'entityType' lub 'nameStartsWith' itd.
  resolveMultiple?: boolean;
}

export interface EntityQueryParam {
  defaultValue?: string;
}

export interface EntityDataSortOrder {
  key: string;
  direction: 'ASC' | 'DESC';
}

export interface EntityDataPageLink {
  pageSize: number;
  page: number;
  sortOrder?: EntityDataSortOrder[];
  textSearch?: string;
}

export interface EntityDataQuery {
  entityFilter: {
    type: string; // 'entityType', 'deviceType', itp.
    resolveMultiple?: boolean;
    parameters?: {
      [key: string]: EntityQueryParam;
    };
  };
  pageLink: EntityDataPageLink;
  pageSize?: number;
  fetchSize?: number;
}

// Response from  /api/entitiesQuery/find
export interface DeviceData {
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
  additionalInfo?: Record<string, any>;
}

export interface EntitiesQueryResponse {
  data: DeviceData[];
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

// /api/notifications{?pageSize,page,textSearch,sortProperty,sortOrder,unreadOnly,deliveryMethod}
export interface Info {
  dashboardId: EntityId;
  stateEntityId: EntityId;
  type: string;
}

export interface Notification {
  requestId: EntityId;
  recipientId: EntityId;
  type?: string;
  deliveryMethod?: string;
  subject?: string;
  text?: string;
  additionalConfig?: Record<string, any>;
  info: Info;
  status?: string;
  id: EntityId;
  createdTime?: number;
}
