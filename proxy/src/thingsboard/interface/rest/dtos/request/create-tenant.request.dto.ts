import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTenantRequestDto {
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
