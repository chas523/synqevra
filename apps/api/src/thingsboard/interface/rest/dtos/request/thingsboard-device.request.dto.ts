import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateDeviceRequest {
  @ApiProperty({
    description: 'Device name (unique identifier)',
    type: String,
    example: 'Temperature Sensor 1',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Human-readable label for the device',
    type: String,
    nullable: true,
    example: 'Living Room',
  })
  @IsOptional()
  @IsString()
  label: string | null;

  @ApiPropertyOptional({
    description: 'Additional device parameters',
    type: [String],
    isArray: true,
    example: ['temperature', 'humidity'],
  })
  @IsOptional()
  @IsArray()
  parameters?: string[];
}
