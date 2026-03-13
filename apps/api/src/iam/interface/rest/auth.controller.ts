import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RefreshAuthGuard } from '../../../auth/guards/refresh-auth/refresh-auth.guard';
import { Public } from '../../../auth/decorators/public.decorator';
import type { Response, Request } from 'express';
import { LocalAuthGuard } from '../../../auth/guards/local-auth/local-auth.guard';
import { CreateUserDto } from './dto/createUserDto';
import type { CurrentUser } from '../../../auth/types/current-user';
import { seconds, Throttle } from '@nestjs/throttler';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { PatientLoginUseCase } from '../../application/use-cases/patient-login.use-case';
import { LoginUserUseCase } from 'src/iam/application/use-cases/login-user.use-case';
import { LogoutUserUseCase } from '../../application/use-cases/logout-user.use-case';
import { RefreshTokensUseCase } from '../../application/use-cases/refresh-token.use-case';
import { Role } from 'src/iam/domain/enums/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { InvitePractitionerDto } from './dto/invitePractitionerDto';
import { InvitePractitionerUseCase } from 'src/iam/application/use-cases/invite-practitioner.use-case';
import { ActiveUser } from 'src/auth/decorators/active-user.decorator';
import { RegisterUserResult } from '../../application/dto/register-user.result';
import { LoginResult } from '../../application/dto/login.result';
import { LogoutResult } from '../../application/dto/logout.result';
import { RefreshTokensResult } from '../../application/dto/refresh-token.result';
import { InvitePractitionerResult } from '../../application/dto/invite-practitioner.result';
import { GetUserProfileUseCase } from 'src/iam/application/use-cases/get-user-profile.use-case';
import { UserProfileResult } from './dto/response/get-user-profile.response.dto';
import { GoogleAuthGuard } from 'src/auth/guards/google-auth/google-auth.guard';
import { SysAdminAuthService } from 'src/thingsboard/application/services/sysadmin-auth.service';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from 'src/thingsboard/application/ports/thingsboard.api.port';
import { Inject } from '@nestjs/common';
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly logoutUserUseCase: LogoutUserUseCase,
    private readonly refreshTokensUseCase: RefreshTokensUseCase,
    private readonly invitePractitionerUseCase: InvitePractitionerUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly patientLoginUseCase: PatientLoginUseCase,
    private readonly sysAdminAuthService: SysAdminAuthService,
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  @ApiOperation({
    summary: '(NOT USED) Register a new user',
    description:
      'Create a new user account with email and password. Not used, because users are being invited by admins',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User registered successfully',
    type: RegisterUserResult,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or user already exists',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'An unexpected error occurred during registration',
  })
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
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user with email and password.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'john.doe@example.com',
          description: 'User email address',
        },
        password: {
          type: 'string',
          example: 'password123',
          description: 'User password (minimum 6 characters)',
          minLength: 6,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful, tokens returned',
    type: LoginResult,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid email or password',
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Too many login attempts, please try again later',
  })
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

  @Public()
  @Get('google/available')
  @ApiOperation({
    summary: 'Check if Google OAuth2 is configured',
    description:
      'Checks ThingsBoard configuration to see if Google login is enabled',
  })
  async isGoogleAuthAvailable() {
    try {
      const token = await this.sysAdminAuthService.getAccessToken();
      const allClientInfos = await this.thingsboardApi.getOAuth2ClientInfos(
        token,
        {
          page: 0,
          pageSize: 50,
          sortProperty: 'createdTime',
          sortOrder: 'DESC',
        },
      );
      const googleClientSummary = (allClientInfos?.data || []).find(
        (client: any) => client.providerName.toLowerCase().includes('google'),
      );
      return { available: !!googleClientSummary };
    } catch (e) {
      return { available: false };
    }
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  async googleLogin() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(
    @Req() req: Request & { user: any },
    @Res({ passthrough: true }) res: Response,
  ) {
    const frontUrl = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';
    if (req.user.status === 'NEW_PENDING_USER') {
      // newly created pending-user entity
      return res.redirect(`${frontUrl}/auth/login?status=new_pending`);
    } else if (req.user.status === 'EXISTING_PENDING_USER') {
      // existing, accepted pending user - already received activation e-mail (if isPending is false in your edit logic)
      if (req.user.isPending) {
        return res.redirect(
          `${frontUrl}/auth/login?status=existing_activation`,
        );
      }
      // existing pending user, but not yet accepted by admins
      return res.redirect(`${frontUrl}/auth/login?status=existing_pending`);
    }

    // user exists - log them in
    await this.loginUserUseCase.execute({
      userId: req.user.user.id,
      role: req.user.user.connectionRole,
      response: res,
    });

    // successfully authenticated
    return res.redirect(`${frontUrl}/devices`);
  }

  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  @ApiOperation({
    summary: 'User logout',
    description:
      'Logout the authenticated user and invalidate their session. Removes cookies containing tokens',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User logged out successfully',
    type: LogoutResult,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
  })
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
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Use a valid refresh token to obtain a new access token (from our database)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token refreshed successfully',
    type: RefreshTokensResult,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired refresh token',
  })
  refresh(
    @Req() req: Request & { user: CurrentUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.refreshTokensUseCase.execute({
      userId: req.user.id,
      response: res,
    });
  }

  @ApiBearerAuth()
  @Roles(Role.MODERATOR)
  @HttpCode(HttpStatus.CREATED)
  @Post('invite')
  @ApiOperation({
    summary: 'Invite a new practitioner',
    description:
      'Send an invitation to a new practitioner to join the system. Happens when Practitioner Admin wants to invite a new practitioner user.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Practitioner invitation sent successfully',
    type: InvitePractitionerResult,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or practitioner already exists',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'User does not have ADMIN role required to invite practitioners',
  })
  async invitePractitioner(
    @Body() invitePractitionerDto: InvitePractitionerDto,
    @ActiveUser() user: CurrentUser,
  ) {
    return this.invitePractitionerUseCase.execute({
      ...invitePractitionerDto,
      currentUser: user,
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @Get('profile')
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Get the profile of the authenticated user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile retrieved successfully',
    type: UserProfileResult,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or missing authentication token',
  })
  async getProfile(@ActiveUser() user: CurrentUser) {
    const userProfile = (await this.getUserProfileUseCase.execute(
      user.id,
      user.connectionRole,
    )) as UserProfileResult;
    return userProfile;
  }
}
