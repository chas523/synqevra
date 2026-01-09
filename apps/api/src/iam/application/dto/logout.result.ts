import { ApiProperty } from '@nestjs/swagger';

export class LogoutResult {
  @ApiProperty({
    description: 'Logout success status',
    example: true,
    type: Boolean,
  })
  success: boolean;

  @ApiProperty({
    description: 'Logout status message',
    example: 'Logged out successfully',
    type: String,
  })
  message: string;
}
