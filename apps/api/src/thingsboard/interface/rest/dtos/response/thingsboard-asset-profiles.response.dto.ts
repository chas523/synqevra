import { ApiProperty } from '@nestjs/swagger';
import { AssetProfile } from 'src/thingsboard/application/ports/thingsboard.api.port';

export class AssetProfilesResponseDto {
  @ApiProperty({
    example: [
      {
        id: {
          entityType: 'ASSET_PROFILE',
          id: '95f6c5f0-1e7b-11f1-a3ca-4b517a5c5e5b',
        },
        createdTime: 1773369000123,
        tenantId: {
          entityType: 'TENANT',
          id: '8a73f670-16a0-11f1-92a0-9f31b2a48858',
        },
        name: 'default',
        description: 'Default asset profile',
        image: null,
        type: 'DEFAULT',
        defaultRuleChainId: null,
        defaultDashboardId: null,
        defaultQueueName: null,
        externalId: null,
        version: 1,
        default: true,
      },
    ],
  })
  data: AssetProfile[];

  @ApiProperty({ example: 1 })
  totalPages: number;

  @ApiProperty({ example: 1 })
  totalElements: number;

  @ApiProperty({ example: false })
  hasNext: boolean;
}
