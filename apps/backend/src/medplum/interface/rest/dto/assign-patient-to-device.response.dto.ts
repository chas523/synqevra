import { ApiProperty } from '@nestjs/swagger';

export class AssignPatientToDeviceResponseDto {
  @ApiProperty({
    description: 'Success status of the assignment',
    example: true,
    type: Boolean,
  })
  success: boolean;

  @ApiProperty({
    description: 'Status message',
    example: 'Patient assigned to device successfully',
    type: String,
  })
  message: string;
}
