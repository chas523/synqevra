import { ApiProperty } from '@nestjs/swagger';

export class TwoFactorAuthProviderDto {
  @ApiProperty()
  providerType: 'TOTP' | 'SMS' | 'EMAIL' | 'BACKUP_CODE';

  @ApiProperty()
  issuerName?: string;

  @ApiProperty()
  verificationCodeLifetime?: number; // for SMS/EMAIL

  @ApiProperty()
  verificationMessageTemplate?: string; // for SMS
}

export class TwoFactorAuthSettingsDto {
  @ApiProperty({ type: [TwoFactorAuthProviderDto] })
  providers: TwoFactorAuthProviderDto[];

  @ApiProperty()
  minVerificationCodeSendPeriod: number;

  @ApiProperty()
  verificationCodeCheckRateLimit: string | null;

  @ApiProperty()
  maxVerificationFailuresBeforeUserLockout: number;

  @ApiProperty()
  totalAllowedTimeForVerification: number;
}
