import { ApiProperty } from '@nestjs/swagger';
import type { EntityId } from '../../../../infrastructure/http/thingsboard.api.types';

export class NotificationRequestResponse {
  @ApiProperty({
    description: 'Notification request ID',
    example: {
      entityType: 'NOTIFICATION_REQUEST',
      id: '784f394c-42b6-435a-983c-b7beff2784f9',
    },
  })
  id: EntityId;

  @ApiProperty({
    description: 'Creation timestamp',
    example: 1644567890000,
  })
  createdTime: number;

  @ApiProperty({
    description: 'Notification status',
    example: 'SCHEDULED',
    enum: ['SCHEDULED', 'PROCESSING', 'SENT'],
  })
  status: string;

  @ApiProperty({
    description: 'Array of target recipient IDs',
    type: [String],
  })
  targets: string[];

  @ApiProperty({
    description: 'Template configuration used',
    required: false,
  })
  template?: Record<string, any>;
}
