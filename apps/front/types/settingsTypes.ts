export interface SecuritySettingsDto {
  passwordPolicy: {
    minimumLength: number;
    maximumLength: number | null;
    minimumUppercaseLetters: number | null;
    minimumLowercaseLetters: number | null;
    minimumDigits: number | null;
    minimumSpecialCharacters: number | null;
    passwordExpirationPeriodDays: number | null;
    passwordReuseFrequencyDays: number | null;
  };
  maxFailedLoginAttempts: number | null;
  userLockoutNotificationEmail: string | null;
  mobileSecretKeyLength: number | null;
  userActivationTokenTtl: number;
  passwordResetTokenTtl: number;
}
