import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';

export class CreateTenantAdminRequestDto {
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
