import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { TenantUser } from '../../../../infrastructure/http/thingsboard.api.types';

export class GetTenantUsersResponse {
  data: TenantUser[];

  @ApiProperty({
    example: 1,
    description: 'Total number of pages',
  })
  totalPages: number;

  @ApiProperty({
    example: 5,
    description: 'Total number of elements',
  })
  totalElements: number;

  @ApiProperty({
    example: false,
    description: 'Whether there are more pages',
  })
  hasNext: boolean;
}
