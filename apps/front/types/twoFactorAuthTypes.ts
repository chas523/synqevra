export interface TwoFactorAuthProvider {
  providerType: "TOTP" | "SMS" | "EMAIL" | "BACKUP_CODE";
  issuerName?: string;
  verificationCodeLifetime?: number;
  verificationMessageTemplate?: string;
}

export interface TwoFactorAuthSettings {
  providers: TwoFactorAuthProvider[];
  minVerificationCodeSendPeriod: number;
  verificationCodeCheckRateLimit: string | null;
  maxVerificationFailuresBeforeUserLockout: number;
  totalAllowedTimeForVerification: number;
}
