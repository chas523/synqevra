import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Role } from '../../domain/enums/role.enum';
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
import { ConnectionRepository } from '../../../connection/domain/repositories/connection.repository';
import { AdminRepository } from '../../domain/repositories/admin.repository';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../../thingsboard/application/ports/thingsboard.api.port';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly adminRepository: AdminRepository,
    private readonly connectionRepository: ConnectionRepository,
    private readonly jwtService: JwtService,
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApiPort: ThingsboardApiPort,
    @Inject(jwtConfig.KEY)
    private readonly jwtTokenConfig: ConfigType<typeof jwtConfig>,
    @Inject(refreshJwtConfig.KEY)
    private readonly refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) { }

  async generateAccessToken(userId: number, role: Role) {
    const payload: AuthJwtPayload = { sub: userId, role };
    return await this.jwtService.signAsync(payload);
  }

  async generateRefreshToken(userId: number, role: Role) {
    const payload: AuthJwtPayload = { sub: userId, role };
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

  async validateUser(email: string, password: string): Promise<CurrentUser> {
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

    // Pobierz role z connection
    const connection = await this.connectionRepository.getConnectionByUserId(
      user.id,
    );
    const connectionRole = connection?.role;

    if (!connectionRole) {
      throw new UnauthorizedException('User role not found');
    }

    return { id: user.id, connectionRole };
  }

  async validateAdmin(email: string, password: string): Promise<CurrentUser> {
    const admin = await this.adminRepository.getAdminByEmail(email);
    const hashToCompare = admin?.password ?? DUMMY_BCRYPT_HASH;
    const isPasswordValid = await compare(password, hashToCompare);

    if (!admin || !admin.id || !isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return { id: admin.id, connectionRole: admin.role };
  }

  async validateJwtUser(userId: number) {
    const user = await this.userRepository.getUserById(userId);
    if (!user || !user.id) return null;

    // Pobierz role z connection
    const connection =
      await this.connectionRepository.getConnectionByUserId(userId);
    if (!connection || !connection.role) return null;

    const currentUser: CurrentUser = {
      id: user.id,
      connectionRole: connection.role,
    };

    return currentUser;
  }

  async validateJwtAdmin(adminId: number) {
    const admin = await this.adminRepository.getAdminById(adminId);
    if (!admin || !admin.id) return null;

    const currentAdmin: CurrentUser = {
      id: admin.id,
      connectionRole: admin.role,
    };

    return currentAdmin;
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

  async validateAdminRefreshToken(adminId: number, refreshToken: string) {
    const admin = await this.adminRepository.getAdminById(adminId);

    if (!admin || !admin.hashedRt) {
      throw new UnauthorizedException('Access Denied');
    }

    const refreshTokenMatches: boolean = await argon2.verify(
      admin.hashedRt,
      refreshToken,
    );
    if (!refreshTokenMatches) throw new UnauthorizedException('Access Denied');

    return { id: admin.id };
  }

  clearAuthCookies(response: Response): void {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token', { path: '/api/auth/refresh' });
  }
}
