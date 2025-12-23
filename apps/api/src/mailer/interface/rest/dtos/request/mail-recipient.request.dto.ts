import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class MailRecipient {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
