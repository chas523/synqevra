import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokensResult {
  @ApiProperty({
    description: 'User ID',
    example: 1,
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'Token refresh success status',
    example: true,
    type: Boolean,
  })
  success: boolean;
}
