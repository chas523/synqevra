import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEmail,
  Min,
  Max,
  ValidateNested,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PasswordPolicyDto {
  @IsNumber()
  @Min(1, { message: 'Minimum length must be at least 1' })
  @Max(100, { message: 'Minimum length cannot exceed 100' })
  minimumLength: number;

  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Maximum length must be at least 1' })
  @Max(500, { message: 'Maximum length cannot exceed 500' })
  maximumLength: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Cannot be negative' })
  @Max(50, { message: 'Cannot exceed 50' })
  minimumUppercaseLetters: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Cannot be negative' })
  @Max(50, { message: 'Cannot exceed 50' })
  minimumLowercaseLetters: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Cannot be negative' })
  @Max(50, { message: 'Cannot exceed 50' })
  minimumDigits: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Cannot be negative' })
  @Max(50, { message: 'Cannot exceed 50' })
  minimumSpecialCharacters: number | null;

  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Must be at least 1 day' })
  @Max(3650, { message: 'Cannot exceed 10 years' })
  passwordExpirationPeriodDays: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Cannot be negative' })
  @Max(3650, { message: 'Cannot exceed 10 years' })
  passwordReuseFrequencyDays: number | null;
}

export class SecuritySettingsDto {
  @ValidateNested()
  @Type(() => PasswordPolicyDto)
  passwordPolicy: PasswordPolicyDto;

  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Must be at least 1' })
  @Max(100, { message: 'Cannot exceed 100' })
  maxFailedLoginAttempts: number | null;

  @IsOptional()
  @IsEmail({}, { message: 'Must be a valid email address' })
  userLockoutNotificationEmail: string | null;

  @IsOptional()
  @IsNumber()
  @Min(8, { message: 'Must be at least 8 characters' })
  @Max(512, { message: 'Cannot exceed 512 characters' })
  mobileSecretKeyLength: number | null;

  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'Must be at least 1 hour' })
  @Max(8760, { message: 'Cannot exceed 1 year' })
  userActivationTokenTtl: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'Must be at least 1 hour' })
  @Max(168, { message: 'Cannot exceed 1 week' })
  passwordResetTokenTtl: number;
}

export class ExtendedPasswordPolicyDto extends PasswordPolicyDto {
  @IsBoolean()
  allowWhitespaces: boolean;

  @IsBoolean()
  forceUserToResetPasswordIfNotValid: boolean;
}

export class ExtendedSecuritySettingsDto {
  @ValidateNested()
  @Type(() => ExtendedPasswordPolicyDto)
  passwordPolicy: ExtendedPasswordPolicyDto;

  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Must be at least 1' })
  @Max(100, { message: 'Cannot exceed 100' })
  maxFailedLoginAttempts: number | null;

  @IsOptional()
  @IsEmail({}, { message: 'Must be a valid email address' })
  userLockoutNotificationEmail: string | null;

  @IsOptional()
  @IsNumber()
  @Min(8, { message: 'Must be at least 8 characters' })
  @Max(512, { message: 'Cannot exceed 512 characters' })
  mobileSecretKeyLength: number | null;

  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'Must be at least 1 hour' })
  @Max(8760, { message: 'Cannot exceed 1 year' })
  userActivationTokenTtl: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'Must be at least 1 hour' })
  @Max(168, { message: 'Cannot exceed 1 week' })
  passwordResetTokenTtl: number;
}
