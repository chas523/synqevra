import { ApiProperty } from '@nestjs/swagger';
import { EntityView } from 'src/thingsboard/infrastructure/http/thingsboard.api.types';

export class EntityViewsResponseDto {
  @ApiProperty({
    example: [
      {
        id: {
          entityType: 'ENTITY_VIEW',
          id: '016c49a0-1b9f-11f1-b41f-efdb4d2475ce',
        },
        createdTime: 1773050516282,
        entityId: {
          entityType: 'DEVICE',
          id: '766baa30-1761-11f1-8ebf-2d463e71ff64',
        },
        name: 'a',
        type: 'a',
        customerTitle: null,
        customerIsPublic: false,
      },
    ],
  })
  data: EntityView[];

  @ApiProperty({ example: 1 })
  totalPages: number;

  @ApiProperty({ example: 1 })
  totalElements: number;

  @ApiProperty({ example: false })
  hasNext: boolean;
}
