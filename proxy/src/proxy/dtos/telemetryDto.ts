import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class TelemetryDto {
  @ApiProperty({
    description: 'ThingsBoard Device ID',
    required: true,
    type: String,
    example: 'a1b2c3d4e5f6g7h8',
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({
    description: 'ThingsBoard Tenant ID',
    required: true,
    type: String,
    example: 'a1b2c3d4e5f6g7h8',
  })
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty({
    description: 'Observation timestamp in ISO 8601 format',
    required: false,
    type: String,
    example: '2024-10-01T12:00:00Z',
  })
  @IsString()
  @IsOptional()
  timestamp?: string;

  @ApiProperty({
    description: 'Telemetry data as key-value pairs',
    required: true,
    type: Object,
    example: { heart_rate: 72, temperature: 36 },
  })
  @IsObject()
  @IsNotEmpty()
  data: Record<string, number>;
}
