import type { EntityId } from 'src/thingsboard/infrastructure/http/thingsboard.api.types';
import { ApiProperty } from '@nestjs/swagger';

export class DeviceDetails {
  @ApiProperty({
    description: 'Device entity ID',
    example: { entityType: 'DEVICE', id: '1234567890abcdef' },
  })
  id: EntityId;

  @ApiProperty({
    description: 'Creation timestamp',
    example: 1704067200000,
  })
  createdTime: number;

  @ApiProperty({
    description: 'Tenant entity ID',
    example: { entityType: 'TENANT', id: '1234567890abcdef' },
  })
  tenantId: EntityId;

  @ApiProperty({
    description: 'Customer entity ID',
    example: { entityType: 'CUSTOMER', id: '1234567890abcdef' },
  })
  customerId: EntityId;

  @ApiProperty({
    description: 'Device name',
    example: 'Temperature Sensor',
  })
  name: string;

  @ApiProperty({
    description: 'Device type',
    example: 'default',
  })
  type: string;

  @ApiProperty({
    description: 'Device label',
    nullable: true,
    example: 'Living Room',
  })
  label: string | null;

  @ApiProperty({
    description: 'Device profile ID',
    example: { entityType: 'DEVICE_PROFILE', id: '1234567890abcdef' },
  })
  deviceProfileId: EntityId;

  @ApiProperty({
    description: 'Firmware ID',
    nullable: true,
    example: null,
  })
  firmwareId: EntityId | null;

  @ApiProperty({
    description: 'Software ID',
    nullable: true,
    example: null,
  })
  softwareId: EntityId | null;

  @ApiProperty({
    description: 'External ID',
    nullable: true,
    example: 'EXT-12345',
  })
  externalId: string | null;

  @ApiProperty({
    description: 'Version number',
    example: 1,
  })
  version: number;

  @ApiProperty({
    description: 'Customer title',
    nullable: true,
    example: 'ACME Corp',
  })
  customerTitle: string | null;

  @ApiProperty({
    description: 'Is customer public',
    example: false,
  })
  customerIsPublic: boolean;

  @ApiProperty({
    description: 'Device profile name',
    example: 'Default Device Profile',
  })
  deviceProfileName: string;

  @ApiProperty({
    description: 'Device active status',
    example: true,
  })
  active: boolean;

  @ApiProperty({
    description: 'Additional device information',
    required: false,
    example: {
      gateway: false,
      overwriteActivityTime: true,
      description: 'Main entrance sensor',
    },
  })
  additionalInfo?: {
    gateway: boolean;
    overwriteActivityTime: boolean;
    description: string;
  };

  @ApiProperty({
    description: 'Device data configuration',
    required: false,
    example: {
      configuration: { type: 'DEFAULT' },
      transportConfiguration: { type: 'MQTT' },
    },
  })
  deviceData?: {
    configuration: {
      type: string;
    };
    transportConfiguration: {
      type: string;
    };
  };
}
