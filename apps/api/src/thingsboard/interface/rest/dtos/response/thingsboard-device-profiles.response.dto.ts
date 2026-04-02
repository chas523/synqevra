import { ApiProperty } from '@nestjs/swagger';
import { DeviceProfile } from 'src/thingsboard/application/ports/thingsboard.api.port';

export class DeviceProfilesResponseDto {
  @ApiProperty({
    example: [
      {
        id: {
          entityType: 'DEVICE_PROFILE',
          id: '61b15110-1e7a-11f1-a3ca-4b517a5c5e5b',
        },
        createdTime: 1773364639903,
        tenantId: {
          entityType: 'TENANT',
          id: '8a73f670-16a0-11f1-92a0-9f31b2a48858',
        },
        name: 'default',
        description: 'Default device profile',
        image: null,
        type: 'DEFAULT',
        transportType: 'DEFAULT',
        provisionType: 'DISABLED',
        defaultRuleChainId: null,
        defaultDashboardId: null,
        defaultQueueName: null,
        provisionDeviceKey: null,
        firmwareId: null,
        softwareId: null,
        defaultEdgeRuleChainId: null,
        externalId: null,
        version: 2,
        default: true,
      },
    ],
  })
  data: DeviceProfile[];

  @ApiProperty({ example: 1 })
  totalPages: number;

  @ApiProperty({ example: 2 })
  totalElements: number;

  @ApiProperty({ example: false })
  hasNext: boolean;
}
