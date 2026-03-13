import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateEntityViewRequestDto {
  @ApiProperty({
    description: 'Entity view name',
    example: 'Room sensors view',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Entity view type',
    example: 'a',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'Source entity type for entity view',
    example: 'DEVICE',
    enum: ['DEVICE', 'ASSET'],
  })
  @IsString()
  @IsIn(['DEVICE', 'ASSET'])
  entityType: 'DEVICE' | 'ASSET';

  @ApiProperty({
    description: 'Source entity id for entity view',
    example: '766baa30-1761-11f1-8ebf-2d463e71ff64',
  })
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @ApiPropertyOptional({
    description: 'Optional description',
    example: 'Entity view created from UI',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Client attributes to expose in entity view',
    example: ['client attributes', 'client attributes2'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  clientAttributes?: string[];

  @ApiPropertyOptional({
    description: 'Shared attributes to expose in entity view',
    example: ['shared attributes', 'shared attributes2'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sharedAttributes?: string[];

  @ApiPropertyOptional({
    description: 'Server attributes to expose in entity view',
    example: ['server attributes', 'server attributes2'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serverAttributes?: string[];

  @ApiPropertyOptional({
    description: 'Timeseries keys to expose in entity view',
    example: ['time series', 'time series2'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  timeSeries?: string[];

  @ApiPropertyOptional({
    description: 'Optional start time in milliseconds',
    example: 1773329160000,
  })
  @IsOptional()
  @IsNumber()
  startTimeMs?: number;

  @ApiPropertyOptional({
    description: 'Optional end time in milliseconds',
    example: 1774503000000,
  })
  @IsOptional()
  @IsNumber()
  endTimeMs?: number;
}
