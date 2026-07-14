import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({
    description: 'First name of the user',
    type: String,
    example: 'John',
  })
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[^0-9]+$/, {
    message: 'First name cannot contain numbers',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value;
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    type: String,
    example: 'Doe',
  })
  @MinLength(2)
  @MaxLength(80)
  @Matches(/^[^0-9]+$/, {
    message: 'Last name cannot contain numbers',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value;
  })
  lastName: string;

  @ApiProperty({
    description: 'Email address of the user',
    type: String,
    example: 'mail@example.com',
  })
  @MinLength(5)
  @MaxLength(254)
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase().trim();
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value;
  })
  email: string;

  @ApiProperty({
    description: 'Password for the user account (minimum 8 characters)',
    type: String,
    example: 'strongPassword123!',
  })
  @MinLength(8)
  @MaxLength(72)
  @Matches(/[a-z]/, {
    message: 'Password must contain at least one lowercase letter',
  })
  @Matches(/[A-Z]/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/[0-9]/, { message: 'Password must contain at least one digit' })
  @Matches(/[!@#$%^&*(),.?":{}|<>]/, {
    message: 'Password must contain at least one special character',
  })
  @IsString()
  password: string;
}
