import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { Device } from 'src/thingsboard/infrastructure/http/thingsboard.api.types';
export class DevicesResponse {
  @ApiProperty({
    example: [
      {
        id: { entityType: 'DEVICE', id: 'uuid-string' },
        name: 'Temperature Sensor 1',
        type: 'default',
        label: 'Living Room',
        version: 0,
        deviceProfileName: 'default',
        active: true,
      },
    ],
  })
  data: Device[];
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
