import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { EntityId } from 'src/thingsboard/infrastructure/http/thingsboard.api.types';

export class EntityViewResponseDto {
  @ApiProperty({
    example: {
      entityType: 'ENTITY_VIEW',
      id: '016c49a0-1b9f-11f1-b41f-efdb4d2475ce',
    },
  })
  id: EntityId;

  @ApiProperty({ example: 1773050516282 })
  createdTime: number;

  @ApiProperty({
    example: {
      entityType: 'DEVICE',
      id: '766baa30-1761-11f1-8ebf-2d463e71ff64',
    },
  })
  entityId: EntityId;

  @ApiProperty({ example: 'a' })
  name: string;

  @ApiProperty({ example: 'a' })
  type: string;

  @ApiPropertyOptional({ nullable: true, example: null })
  customerTitle?: string | null;

  @ApiProperty({ example: false })
  customerIsPublic?: boolean;
}
