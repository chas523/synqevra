import { ApiProperty } from '@nestjs/swagger';
import { PendingUserStatus } from '../../../domain/enums/status.enum';

export class PendingUserResponseDto {
  @ApiProperty({
    description: 'Pending user ID',
    example: 1,
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    type: String,
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    type: String,
  })
  lastName: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    type: String,
  })
  email: string;

  @ApiProperty({
    description: 'Current status of the pending user account',
    enum: PendingUserStatus,
    example: PendingUserStatus.NEW,
    type: String,
  })
  status: PendingUserStatus;

  @ApiProperty({
    description: 'Timestamp when the pending user was created',
    example: '2026-01-07T10:30:00Z',
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Activation token for email verification',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: String,
    required: false,
  })
  activationToken?: string;

  @ApiProperty({
    description: 'Expiration date of the activation token',
    example: '2026-01-14T10:30:00Z',
    type: Date,
    required: false,
  })
  expiresAt?: Date;
}
