import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { RefreshAuthGuard } from '../../../auth/guards/refresh-auth/refresh-auth.guard';
import { Public } from '../../../auth/decorators/public.decorator';
import type { Response, Request } from 'express';
import { LocalAuthGuard } from '../../../auth/guards/local-auth/local-auth.guard';
import { CreateUserDto } from './dto/createUserDto';
import type { CurrentUser } from '../../../auth/types/current-user';
import { seconds, Throttle } from '@nestjs/throttler';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { LoginUserUseCase } from 'src/iam/application/use-cases/login-user.use-case';
import { LogoutUserUseCase } from '../../application/use-cases/logout-user.use-case';
import { RefreshTokensUseCase } from '../../application/use-cases/refresh-token.use-case';
import { Role } from 'src/iam/domain/enums/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { InvitePractitionerDto } from './dto/invitePractitionerDto';
import { InvitePractitionerUseCase } from 'src/iam/application/use-cases/invite-practitioner.use-case';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly logoutUserUseCase: LogoutUserUseCase,
    private readonly refreshTokensUseCase: RefreshTokensUseCase,
    private readonly invitePractitionerUseCase: InvitePractitionerUseCase,
  ) {}

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.registerUserUseCase.execute({ createUserDto, response: res });
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
    return this.loginUserUseCase.execute({
      userId: req.user.id,
      role: req.user.connectionRole,
      response: res,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(
    @Req() req: Request & { user: CurrentUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.logoutUserUseCase.execute({
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
    return this.refreshTokensUseCase.execute({
      userId: req.user.id,
      response: res,
    });
  }

  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @Post('invite')
  async invitePractitioner(
    @Body() invitePractitionerDto: InvitePractitionerDto,
    @ActiveUser() user: CurrentUser,
  ) {
    return this.invitePractitionerUseCase.execute({
      ...invitePractitionerDto,
      currentUser: user,
    });
  }
}
