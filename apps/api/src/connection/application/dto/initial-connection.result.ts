import { ApiProperty } from '@nestjs/swagger';

export class InitialConnectionResult {
  @ApiProperty({
    description: 'Success status of the connection initialization',
    example: true,
    type: Boolean,
  })
  success: boolean;

  @ApiProperty({
    description: 'Tenant ID',
    example: '1',
    type: String,
  })
  tenantId: string;

  @ApiProperty({
    description: 'JWT access token for authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: String,
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    type: String,
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Status message',
    example: 'Tenant and admin account created successfully',
    type: String,
  })
  message: string;
}
