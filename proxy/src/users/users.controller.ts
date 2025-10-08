import { Controller, Get, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { Role } from '../auth/enums/role.enum';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfileById(@Req() req: any) {
    return this.usersService.getUserById(req.user.id);
  }

  @Roles(Role.ADMIN)
  @Get('getAll')
  getAllUsers() {
    return this.usersService.getAllUsers();
  }
}
