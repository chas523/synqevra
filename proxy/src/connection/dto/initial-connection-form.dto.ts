import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TenantFieldsDto {
  @ApiProperty({ description: 'Tenant title', example: 'My Tenant' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Tenant description',
    example: 'Opis najemcy',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Country', example: 'Poland' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'City', example: 'Warsaw' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'State', example: 'Mazowieckie' })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({ description: 'Zip code', example: '00-001' })
  @IsString()
  @IsOptional()
  zipCode?: string;

  @ApiPropertyOptional({ description: 'Address', example: 'ul. Przykładowa 1' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'Address 2', example: 'lok. 2' })
  @IsString()
  @IsOptional()
  address2?: string;

  @ApiPropertyOptional({ description: 'Phone', example: '+48123456789' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Tenant email',
    example: 'tenant@example.com',
  })
  @IsString()
  @IsOptional()
  tenantEmail?: string;
}

class UserFieldsDto {
  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  userEmail: string;

  @ApiPropertyOptional({ description: 'First name', example: 'Jan' })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name', example: 'Kowalski' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ description: 'User phone', example: '+48523456789' })
  @IsString()
  @IsOptional()
  userPhone?: string;

  @ApiPropertyOptional({
    description: 'User description',
    example: 'Opis użytkownika',
  })
  @IsString()
  @IsOptional()
  userDescription?: string;

  @ApiProperty({ description: 'Password', example: 'secret123' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'Confirm password', example: 'secret123' })
  @IsString()
  @MinLength(6, { message: 'Confirm password is required' })
  @IsNotEmpty()
  confirmPassword: string;
}

export class InitialConnectionFormDto {
  @ApiProperty({ type: TenantFieldsDto })
  @ValidateNested()
  @Type(() => TenantFieldsDto)
  tenantFields: TenantFieldsDto;

  @ApiProperty({ type: UserFieldsDto })
  @ValidateNested()
  @Type(() => UserFieldsDto)
  userFields: UserFieldsDto;
}
