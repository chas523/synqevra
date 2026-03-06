import { ApiProperty } from '@nestjs/swagger';

export class TwoFactorAuthProviderRequestDto {
  @ApiProperty()
  providerType: 'TOTP' | 'SMS' | 'EMAIL' | 'BACKUP_CODE';

  @ApiProperty({ required: false })
  issuerName?: string;

  @ApiProperty({ required: false })
  verificationCodeLifetime?: number;

  @ApiProperty({ required: false })
  verificationMessageTemplate?: string;
}

export class TwoFactorAuthSettingsRequestDto {
  @ApiProperty({ type: [TwoFactorAuthProviderRequestDto] })
  providers: TwoFactorAuthProviderRequestDto[];

  @ApiProperty()
  minVerificationCodeSendPeriod: number;

  @ApiProperty({ required: false })
  verificationCodeCheckRateLimit?: string;

  @ApiProperty()
  maxVerificationFailuresBeforeUserLockout: number;

  @ApiProperty()
  totalAllowedTimeForVerification: number;
}
