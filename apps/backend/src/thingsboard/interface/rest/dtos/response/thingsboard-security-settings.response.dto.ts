import { Expose, Type } from 'class-transformer';

export class PasswordPolicyDto {
  @Expose()
  minimumLength: number;

  @Expose()
  maximumLength: number | null;

  @Expose()
  minimumUppercaseLetters: number | null;

  @Expose()
  minimumLowercaseLetters: number | null;

  @Expose()
  minimumDigits: number | null;

  @Expose()
  minimumSpecialCharacters: number | null;

  @Expose()
  passwordExpirationPeriodDays: number | null;

  @Expose()
  passwordReuseFrequencyDays: number | null;
}

export class SecuritySettingsDto {
  @Expose()
  @Type(() => PasswordPolicyDto)
  passwordPolicy: PasswordPolicyDto;

  @Expose()
  maxFailedLoginAttempts: number | null;

  @Expose()
  userLockoutNotificationEmail: string | null;

  @Expose()
  mobileSecretKeyLength: number | null;

  @Expose()
  userActivationTokenTtl: number;

  @Expose()
  passwordResetTokenTtl: number;
}
