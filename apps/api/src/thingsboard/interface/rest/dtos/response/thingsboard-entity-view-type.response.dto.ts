import { ApiProperty } from '@nestjs/swagger';
import type { EntityId } from 'src/thingsboard/infrastructure/http/thingsboard.api.types';

export class EntityViewTypeResponseDto {
  @ApiProperty({
    example: {
      entityType: 'TENANT',
      id: '8a73f670-16a0-11f1-92a0-9f31b2a48858',
    },
  })
  tenantId: EntityId;

  @ApiProperty({ example: 'ENTITY_VIEW' })
  entityType: 'ENTITY_VIEW';

  @ApiProperty({ example: 'default' })
  type: string;
}
