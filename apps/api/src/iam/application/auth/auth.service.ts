import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthJwtPayload } from '../../../auth/types/auth-jwtPayload';
import refreshJwtConfig from '../../../config/refresh-jwt.config';
import type { ConfigType } from '@nestjs/config';
import { CurrentUser } from '../../../auth/types/current-user';
import type { Response } from 'express';
import jwtConfig from '../../../config/jwt.config';
import { DUMMY_BCRYPT_HASH } from '../../infrastructure/constants/user-utils';
import * as argon2 from 'argon2';
import { UserRepository } from '../../domain/repositories/user.repository';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../../thingsboard/application/ports/thingsboard.api.port';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApiPort: ThingsboardApiPort,
    @Inject(jwtConfig.KEY)
    private readonly jwtTokenConfig: ConfigType<typeof jwtConfig>,
    @Inject(refreshJwtConfig.KEY)
    private readonly refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}

  async generateAccessToken(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };
    return await this.jwtService.signAsync(payload);
  }

  async generateRefreshToken(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };
    return await this.jwtService.signAsync(payload, this.refreshTokenConfig);
  }

  private setAccessTokenCookie(response: Response, accessToken: string) {
    const expiresInSec =
      (this.jwtTokenConfig.signOptions?.expiresIn as number) || 3600;

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: expiresInSec * 1000,
    });
  }

  setTokenCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    this.setAccessTokenCookie(response, accessToken);

    const expiresInSec =
      (this.refreshTokenConfig.expiresIn as number) || 604800;

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: expiresInSec * 1000,
      path: '/api/auth/refresh',
    });
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.getUserByEmail(email);

    const hashToCompare = user?.password ?? DUMMY_BCRYPT_HASH;
    const isPasswordValid = await compare(password, hashToCompare);

    if (!user || !user.id || !isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    console.log('validating');

    try {
      await this.thingsboardApiPort.login(user.id, email, password);
    } catch (error) {
      console.warn('ThingsBoard login failed during validation:', error);
    }

    return { id: user.id, role: user.role };
  }

  async validateJwtUser(userId: number) {
    const user = await this.userRepository.getUserById(userId);
    if (!user || !user.id || !user.role)
      throw new UnauthorizedException('User not found');
    const currentUser: CurrentUser = { id: user.id, role: user.role };

    return currentUser;
  }

  async validateRefreshToken(userId: number, refreshToken: string) {
    const user = await this.userRepository.getUserById(userId);

    if (!user || !user.hashedRt) {
      throw new UnauthorizedException('Access Denied');
    }

    const refreshTokenMatches: boolean = await argon2.verify(
      user.hashedRt,
      refreshToken,
    );
    if (!refreshTokenMatches) throw new UnauthorizedException('Access Denied');

    return { id: user.id };
  }

  clearAuthCookies(response: Response): void {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token', { path: '/api/auth/refresh' });
  }
}
