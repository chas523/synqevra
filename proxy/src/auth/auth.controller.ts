import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { Public } from './decorators/public.decorator';
import type { Response, Request } from 'express';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { CreateUserDto } from '../users/dtos/createUserDto';
import { CurrentUser } from './types/current-user';
import { seconds, Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.register(createUserDto, res);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @Throttle({ default: { ttl: seconds(30), limit: 5 } })
  async login(
    @Req() req: Request & { user: CurrentUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(req.user.id, req.user.role, res);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(
    @Req() req: Request & { user: CurrentUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout(req.user.id, res);
  }

  @Public()
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refresh(
    @Req() req: Request & { user: CurrentUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refresh(req.user.id, res);
  }
}
