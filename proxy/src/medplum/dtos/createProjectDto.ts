import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    description: 'First name of the user',
    type: String,
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    type: String,
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Email address of the user',
    type: String,
    example: 'mail@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password for the user account (minimum 8 characters)',
    type: String,
    example: 'strongPassword123',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Project name',
    type: String,
    example: 'Test Project',
  })
  @IsString()
  @IsNotEmpty()
  project: string;
}
