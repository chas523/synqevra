import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsEmail,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class InvitePractitionerDto {
  @ApiProperty({
    description: 'First name of the user',
    type: String,
    example: 'John',
  })
  @MinLength(2, {
    message: 'First name must be at least 2 characters long',
  })
  @MaxLength(50, {
    message: 'First name must not exceed 50 characters',
  })
  @Matches(/^[^0-9]+$/, {
    message: 'First name cannot contain numbers',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    type: String,
    example: 'Doe',
  })
  @MinLength(2, {
    message: 'Last name must be at least 2 characters long',
  })
  @MaxLength(50, {
    message: 'Last name must not exceed 50 characters',
  })
  @Matches(/^[^0-9]+$/, {
    message: 'Last name cannot contain numbers',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @ApiProperty({
    description: 'Email address of the user',
    type: String,
    example: 'john.doe@example.com',
  })
  @IsEmail(
    {},
    {
      message: 'Email must be a valid email address',
    },
  )
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim().toLowerCase())
  email: string;
}
