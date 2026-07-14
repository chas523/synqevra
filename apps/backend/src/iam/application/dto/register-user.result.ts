import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserResult {
  @ApiProperty({
    description: 'User ID',
    example: 1,
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    type: String,
  })
  email: string;

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
}
