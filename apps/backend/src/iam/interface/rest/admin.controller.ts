import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RefreshTokensUseCase } from '../../application/use-cases/refresh-token.use-case';
import { Public } from '../../../auth/decorators/public.decorator';
import { seconds, Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import type { CurrentUser } from '../../../auth/types/current-user';
import { LocalAdminAuthGuard } from '../../../auth/guards/local-auth/local-admin-auth.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { Role } from '../../domain/enums/role.enum';
import { LoginAdminUseCase } from '../../application/use-cases/login-admin.use-case';
import { LogoutAdminUseCase } from '../../application/use-cases/logout-admin.use-case';
import { RefreshAuthGuard } from '../../../auth/guards/refresh-auth/refresh-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(
    private readonly loginAdminUseCase: LoginAdminUseCase,
    private readonly refreshTokensUseCase: RefreshTokensUseCase,
    private readonly logoutAdminUseCase: LogoutAdminUseCase,
  ) {}

  @Public()
  @UseGuards(LocalAdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @Throttle({ default: { ttl: seconds(30), limit: 5 } })
  async login(
    @Req() req: Request & { user: CurrentUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.loginAdminUseCase.execute({
      userId: req.user.id,
      role: req.user.connectionRole,
      response: res,
    });
  }

  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(
    @Req() req: Request & { user: CurrentUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.logoutAdminUseCase.execute({
      userId: req.user.id,
      response: res,
    });
  }

  @Public()
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refresh(
    @Req() req: Request & { user: CurrentUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.refreshTokensUseCase.executeForAdmin({
      userId: req.user.id,
      response: res,
    });
  }
}
