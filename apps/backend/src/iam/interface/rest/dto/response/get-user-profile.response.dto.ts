import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/iam/domain/enums/role.enum';

export class UserProfileResult {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier of the user',
  })
  id: number;

  @ApiProperty({
    example: 'John',
    description: 'The first name of the user',
  })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the user',
  })
  lastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email address of the user',
  })
  email: string;

  @ApiProperty({
    enum: Role,
    example: Role.PRACTITIONER,
    description: 'The role assigned to the user',
  })
  role: Role;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The tenant ID of the user (if applicable)',
    required: false,
    nullable: true,
  })
  tenantId?: string | null;
}
