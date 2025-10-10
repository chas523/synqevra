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
import type { Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { CreateUserDto } from '../users/dtos/createUserDto';

@Controller('api/auth')
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
  async login(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(req.user.id, res);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  @Public()
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    return this.authService.refresh(req.user.id, res);
  }
}
