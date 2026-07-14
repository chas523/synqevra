import { ApiProperty } from '@nestjs/swagger';

export class ConfirmPractitionerResult {
  @ApiProperty({
    description: 'Success status of the practitioner confirmation',
    example: true,
    type: Boolean,
  })
  success: boolean;

  @ApiProperty({
    description: 'Practitioner ID',
    example: '1',
    type: String,
    required: false,
  })
  practitionerId?: string;

  @ApiProperty({
    description: 'Status message',
    example: 'Practitioner account confirmed successfully',
    type: String,
  })
  message: string;
}
