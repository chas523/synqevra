import { ApiProperty } from '@nestjs/swagger';

export class InvitePractitionerResult {
  @ApiProperty({
    description: 'Practitioner ID',
    example: 1,
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'Practitioner email address',
    example: 'practitioner@example.com',
    type: String,
  })
  email: string;

  @ApiProperty({
    description: 'Activation token for email verification',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: String,
  })
  activationToken: string;
}
