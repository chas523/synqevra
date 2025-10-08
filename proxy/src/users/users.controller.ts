import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/createUserDto';
import { LoginUserDto } from './dtos/loginUserDto';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body(ValidationPipe) dto: CreateUserDto) {
    return await this.usersService.createUser(dto);
  }

  @Post('login')
  async login(@Body(ValidationPipe) dto: LoginUserDto) {
    return await this.usersService.getUserByEmail(dto.email);
  }
}
