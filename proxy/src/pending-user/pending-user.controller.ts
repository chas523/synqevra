import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';
import { PendingUserService } from './pending-user.service';

import type { CreatePendingUserDto } from './dtos/create-pending-user.dto';
import type { RequestedAccessUsersRequestOptions } from './dtos/requested-access-users-request-options.dto';

@Controller('pending-user')
export class PendingUserController {
  constructor(private readonly pendingUserService: PendingUserService) {}

  @Public()
  @Get('/list')
  getPendingUserList(@Query() options: RequestedAccessUsersRequestOptions) {
    return this.pendingUserService.getPendingUserListPaginated(options);
  }

  @Public()
  @Post('/create')
  createPendingUser(@Body() pendingUserDto: CreatePendingUserDto) {
    return this.pendingUserService.addPendingUser(pendingUserDto);
  }
}
