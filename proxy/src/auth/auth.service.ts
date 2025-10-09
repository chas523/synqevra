import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import refreshJwtConfig from '../config/refresh-jwt.config';
import * as config from '@nestjs/config';
import { CurrentUser } from './types/current-user';
import type { Response } from 'express';
import jwtConfig from '../config/jwt.config';
import { CreateUserDto } from '../users/dtos/createUserDto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private readonly jwtTokenConfig: config.ConfigType<typeof jwtConfig>,

    @Inject(refreshJwtConfig.KEY)
    private readonly refreshTokenConfig: config.ConfigType<
      typeof refreshJwtConfig
    >,
  ) {}

  private async generateTokens(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshTokenConfig),
    ]);
    return { accessToken, refreshToken };
  }

  private setAccessTokenCookie(response: Response, accessToken: string) {
    const expiresInSec =
      (this.jwtTokenConfig.signOptions?.expiresIn as number) || 3600;

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: expiresInSec * 1000,
    });
  }

  private setTokenCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    this.setAccessTokenCookie(response, accessToken);

    const expiresInSec =
      (this.refreshTokenConfig.expiresIn as number) || 604800;

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: expiresInSec * 1000,
      path: '/api/auth/refresh',
    });
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.getUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User does not exist');
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { id: user.id };
  }

  async validateJwtUser(userId: number) {
    const user = await this.usersService.getUserById(userId);
    if (!user) throw new UnauthorizedException('User does not exist');
    const currentUser: CurrentUser = { id: user.id, role: user.role };

    return currentUser;
  }

  async register(createUserDto: CreateUserDto, response: Response) {
    const existingUser = await this.usersService.getUserByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const newUser = await this.usersService.createUser(createUserDto);

    const { accessToken, refreshToken } = await this.generateTokens(newUser.id);

    this.setTokenCookies(response, accessToken, refreshToken);

    return {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
    };
  }

  async login(userId: number, response: Response) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);

    this.setTokenCookies(response, accessToken, refreshToken);
    return { id: userId, success: true };
  }

  logout(response: Response) {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token', { path: '/api/auth/refresh' });
    return { success: true, message: 'Logged out successfully' };
  }

  refresh(userId: number, response: Response) {
    const payload: AuthJwtPayload = { sub: userId };
    const accessToken = this.jwtService.sign(payload);

    this.setAccessTokenCookie(response, accessToken);
    return { id: userId, success: true };
  }
}
