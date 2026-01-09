import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { EntityId } from 'src/thingsboard/infrastructure/http/thingsboard.api.types';

export class Device {
  @ApiProperty({
    description: 'Device entity ID',
    example: {
      entityType: 'DEVICE',
      id: '550e8400-e29b-41d4-a716-446655440000',
    },
  })
  id: EntityId;

  @ApiProperty({
    description: 'Device name',
    type: String,
    example: 'Temperature Sensor 1',
  })
  name: string;

  @ApiProperty({
    description: 'Device type',
    type: String,
    example: 'default',
  })
  type: string;

  @ApiPropertyOptional({
    description: 'Device label',
    type: String,
    nullable: true,
    example: 'Living Room',
  })
  label: string | null;

  @ApiProperty({
    description: 'Device configuration version',
    type: Number,
    example: 0,
  })
  version: number;

  @ApiProperty({
    description: 'Device profile name',
    type: String,
    example: 'default',
  })
  deviceProfileName: string;

  @ApiProperty({
    description: 'Whether the device is active',
    type: Boolean,
    example: true,
  })
  active: boolean;
}
