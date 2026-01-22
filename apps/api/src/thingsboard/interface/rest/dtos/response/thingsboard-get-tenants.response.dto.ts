import { Tenant } from '../../../../infrastructure/http/thingsboard.api.types';
import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';

export class GetTenantsResponse {
  @ApiProperty({
    example: [
      {
        id: {
          id: '784f394c-42b6-435a-983c-b7beff2784f9',
          entityType: 'TENANT',
        },
        createdTime: 1609459200000,
        country: 'US',
        state: 'NY',
        city: 'New York',
        address: '42',
        address2: 'string',
        zip: '10004',
        phone: '+1(415)777-7777',
        email: 'example@company.com',
        title: 'Company A',
        region: 'North America',
        tenantProfileId: {
          id: '784f394c-42b6-435a-983c-b7beff2784f9',
          entityType: 'TENANT_PROFILE',
        },
        version: 0,
        name: 'Company A',
        additionalInfo: {},
      },
    ],
  })
  data: Tenant[];

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
