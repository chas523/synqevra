import { ApiProperty } from '@nestjs/swagger';
import { Asset } from 'src/thingsboard/infrastructure/http/thingsboard.api.types';

export class AssetsResponseDto {
  @ApiProperty({
    example: [
      {
        id: { entityType: 'ASSET', id: '9a6eed00-18ee-11f1-b0a8-efdb4d2475ce' },
        createdTime: 1772754849744,
        name: 'a',
        type: 'default',
        label: null,
        assetProfileName: 'default',
        customerTitle: null,
        customerIsPublic: false,
      },
    ],
  })
  data: Asset[];

  @ApiProperty({ example: 1 })
  totalPages: number;

  @ApiProperty({ example: 1 })
  totalElements: number;

  @ApiProperty({ example: false })
  hasNext: boolean;
}
