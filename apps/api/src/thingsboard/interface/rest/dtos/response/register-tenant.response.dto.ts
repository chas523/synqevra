export interface RollbackData {
  tenantId: string;
  userId: string | null;
  sysAdminAccessToken: string;
}

export class RegisterTenantResponseDto {
  success: boolean;
  tenantId: string;
  accessToken: string;
  refreshToken: string;
  message: string;
  rollbackData: RollbackData;
}
