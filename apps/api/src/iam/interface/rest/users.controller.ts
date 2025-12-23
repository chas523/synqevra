import { Controller, Get, Req, Query } from '@nestjs/common';
import { Role } from '../../domain/enums/role.enum';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { Public } from '../../../auth/decorators/public.decorator';
import type { Request } from 'express';
import { CurrentUser } from '../../../auth/types/current-user';
import { UserRepository } from '../../domain/repositories/user.repository';
import { GetUserByTokenUseCase } from '../../application/use-cases/get-user-by-token.use-case';
import { GetUserByTokenResponseDto } from './dto/response/get-user-by-token.response.dto';

@Controller('user')
export class UsersController {
  constructor(
    private readonly usersService: UserRepository,
    private readonly getUserByTokenUseCase: GetUserByTokenUseCase,
  ) {}

  @Get('profile')
  getProfileById(@Req() req: Request & { user: CurrentUser }) {
    return this.usersService.getUserByIdNoToken(req.user.id);
  }

  @Roles(Role.ADMIN)
  @Get('getAll')
  getAllUsers() {
    return this.usersService.findAll();
  }

  @Public()
  @Get('by-token')
  async getUserByToken(
    @Query('token') token: string,
  ): Promise<GetUserByTokenResponseDto> {
    return this.getUserByTokenUseCase.execute(token);
  }
}
