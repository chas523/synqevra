import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { EntityId } from 'src/thingsboard/infrastructure/http/thingsboard.api.types';

export class AssetResponseDto {
  @ApiProperty({
    example: {
      entityType: 'ASSET',
      id: '9a6eed00-18ee-11f1-b0a8-efdb4d2475ce',
    },
  })
  id: EntityId;

  @ApiProperty({ example: 1772754849744 })
  createdTime: number;

  @ApiProperty({ example: 'a' })
  name: string;

  @ApiProperty({ example: 'default' })
  type: string;

  @ApiPropertyOptional({ nullable: true, example: null })
  label: string | null;

  @ApiProperty({ example: 'default' })
  assetProfileName: string;

  @ApiPropertyOptional({ nullable: true, example: null })
  customerTitle: string | null;

  @ApiProperty({ example: false })
  customerIsPublic: boolean;
}
