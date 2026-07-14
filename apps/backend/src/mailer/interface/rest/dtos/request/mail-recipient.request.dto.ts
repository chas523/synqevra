import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class MailRecipient {
  @ApiProperty({
    description: 'First name of the recipient',
    example: 'John',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  firstName: string;

  @ApiProperty({
    description: 'Last name of the recipient',
    example: 'Doe',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  lastName: string;

  @ApiProperty({
    description: 'Email address of the recipient',
    example: 'john.doe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
