export interface RollbackData {
  tenantId: string;
  userId: string | null;
  sysAdminAccessToken: string;
}

export class ConfirmPractitionerResponseDto {
  success: boolean;
  tenantId: string;
  accessToken: string;
  refreshToken: string;
  message: string;
  rollbackData: RollbackData;
}
