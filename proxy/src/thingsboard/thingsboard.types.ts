export interface ThingsboardLoginResponse {
  token: string;
  refreshToken: string;
}
export interface ThingsboardDefaultTenantProfileResponse {
  id: EntityId;
  name: string;
}

export interface EntityId {
  entityType: string;
  id: string;
}

export interface JwtPayload {
  customerId: string;
  tenantId: string;
  userId: string;
}

export interface ThingsboardRollbackData {
  tenantId: EntityId | null;
  userId: string | null;
  sysAdminAccessToken: string;
}
