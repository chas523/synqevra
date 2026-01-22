import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { Notification } from '../../../../infrastructure/http/thingsboard.api.types';

export class GetNotificationsResponse {
  @ApiProperty({
    description: 'List of devices belonging to the tenant',
    isArray: true,
  })
  data: Notification[];

  @ApiProperty({
    example: 1,
    description: 'Total number of pages',
  })
  totalPages: number;

  @ApiProperty({
    example: 25,
    description: 'Total number of devices',
  })
  totalElements: number;

  @ApiProperty({
    example: false,
    description: 'Whether there are more pages',
  })
  hasNext: boolean;
}
