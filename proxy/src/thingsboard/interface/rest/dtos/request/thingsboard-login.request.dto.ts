import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ThingsboardLoginRequestDto {
  @ApiProperty({ description: 'Username/Email', example: 'user@example.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Password', example: 'secret123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
