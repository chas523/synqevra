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
import type { ConfigType } from '@nestjs/config';
import { CurrentUser } from './types/current-user';
import type { Response } from 'express';
import jwtConfig from '../config/jwt.config';
import { CreateUserDto } from '../users/dtos/createUserDto';
import { DUMMY_BCRYPT_HASH } from '../users/constants/user-utils';
import { Role } from './enums/role.enum';
import * as argon2 from 'argon2';
import { ThingsboardService } from '../thingsboard/thingsboard.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly thingsboardService: ThingsboardService,

    @Inject(jwtConfig.KEY)
    private readonly jwtTokenConfig: ConfigType<typeof jwtConfig>,

    @Inject(refreshJwtConfig.KEY)
    private readonly refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}

  private async generateAccessToken(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };
    return await this.jwtService.signAsync(payload);
  }

  private async generateRefreshToken(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };
    return await this.jwtService.signAsync(payload, this.refreshTokenConfig);
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

    const hashToCompare = user?.password ?? DUMMY_BCRYPT_HASH;
    const isPasswordValid = await compare(password, hashToCompare);

    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    try {
      await this.thingsboardService.thingsboardLogin(user.id, email, password);
    } catch (error) {
      console.warn('ThingsBoard login failed during validation:', error);
    }

    return { id: user.id, role: user.role };
  }

  async validateJwtUser(userId: number) {
    const user = await this.usersService.getUserById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    const currentUser: CurrentUser = { id: user.id, role: user.role };

    return currentUser;
  }

  async validateRefreshToken(userId: number, refreshToken: string) {
    const user = await this.usersService.getUserById(userId);

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

  async register(createUserDto: CreateUserDto, response: Response) {
    const existingUser = await this.usersService.getUserByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const newUser = await this.usersService.createUser(createUserDto);
    const accessToken = await this.generateAccessToken(newUser.id);
    const refreshToken = await this.generateRefreshToken(newUser.id);

    this.setTokenCookies(response, accessToken, refreshToken);

    return {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
    };
  }

  async login(userId: number, role: Role, response: Response) {
    const accessToken = await this.generateAccessToken(userId);
    const refreshToken = await this.generateRefreshToken(userId);
    const hashedRt = await argon2.hash(refreshToken);

    await this.usersService.updateHashedRt(userId, hashedRt);

    this.setTokenCookies(response, accessToken, refreshToken);
    return { id: userId, role: role, success: true };
  }

  async logout(userId: number, response: Response) {
    console.log('logout triggered');
    await this.usersService.updateHashedRt(userId, null);

    response.clearCookie('access_token');
    response.clearCookie('refresh_token', { path: '/api/auth/refresh' });
    return { success: true, message: 'Logged out successfully' };
  }

  async refresh(userId: number, response: Response) {
    const accessToken = await this.generateAccessToken(userId);
    const refreshToken = await this.generateRefreshToken(userId);
    const hashedRt = await argon2.hash(refreshToken);

    await this.usersService.updateHashedRt(userId, hashedRt);

    this.setTokenCookies(response, accessToken, refreshToken);
    return { id: userId, success: true };
  }
}
