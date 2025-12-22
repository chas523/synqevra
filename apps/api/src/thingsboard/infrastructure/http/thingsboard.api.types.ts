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
