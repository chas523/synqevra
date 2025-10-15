import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from '../../users/dtos/createUserDto';

export class CreateProjectDto extends CreateUserDto {
  @ApiProperty({
    description: 'Project name',
    type: String,
    example: 'Test Project',
  })
  @IsString()
  @IsNotEmpty()
  project: string;
}
