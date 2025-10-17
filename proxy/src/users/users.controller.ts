import { Controller, Get, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { Role } from '../auth/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import type { Request } from 'express';
import { CurrentUser } from '../auth/types/current-user';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfileById(@Req() req: Request & { user: CurrentUser }) {
    return this.usersService.getUserByIdNoToken(req.user.id);
  }

  @Roles(Role.ADMIN)
  @Get('getAll')
  getAllUsers() {
    return this.usersService.getAllUsers();
  }
}
