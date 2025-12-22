import { Controller, Get, Req } from '@nestjs/common';
import { Role } from '../../domain/enums/role.enum';
import { Roles } from '../../../auth/decorators/roles.decorator';
import type { Request } from 'express';
import { CurrentUser } from '../../../auth/types/current-user';
import { UserRepository } from '../../domain/repositories/user.repository';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UserRepository) {}

  @Get('profile')
  getProfileById(@Req() req: Request & { user: CurrentUser }) {
    return this.usersService.getUserByIdNoToken(req.user.id);
  }

  @Roles(Role.ADMIN)
  @Get('getAll')
  getAllUsers() {
    return this.usersService.findAll();
  }
}
