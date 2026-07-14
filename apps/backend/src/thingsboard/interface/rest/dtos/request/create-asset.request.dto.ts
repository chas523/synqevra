import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAssetRequestDto {
  @ApiProperty({
    description: 'Asset name',
    example: 'a',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Optional asset label',
    example: 'Main hallway',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  label?: string | null;

  @ApiProperty({
    description: 'Asset profile id',
    example: '8a919090-16a0-11f1-92a0-9f31b2a48858',
  })
  @IsString()
  @IsNotEmpty()
  assetProfileId: string;

  @ApiProperty({
    description: 'Customer id',
    example: '1ffefd60-1760-11f1-8ebf-2d463e71ff64',
  })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiPropertyOptional({
    description: 'Optional description',
    example: 'Asset used in test flow',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
