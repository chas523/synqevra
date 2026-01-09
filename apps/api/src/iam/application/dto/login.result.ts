import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../domain/enums/role.enum';

export class LoginResult {
  @ApiProperty({
    description: 'User ID',
    example: 1,
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'User role',
    enum: Role,
    example: Role.PRACTITIONER,
  })
  role: Role;

  @ApiProperty({
    description: 'Login success status',
    example: true,
    type: Boolean,
  })
  success: boolean;
}
