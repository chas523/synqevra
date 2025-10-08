import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import refreshJwtConfig from '../config/refresh-jwt.config';
import * as config from '@nestjs/config';
import { CurrentUser } from './types/current-user';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
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

  async login(userId: number) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    return { id: userId, accessToken, refreshToken };
  }

  refresh(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };
    const token = this.jwtService.sign(payload);

    return {
      id: userId,
      token,
    };
  }

  async validateJwtUser(userId: number) {
    const user = await this.usersService.getUserById(userId);
    if (!user) throw new UnauthorizedException('User does not exist');
    const currentUser: CurrentUser = { id: user.id, role: user.role };

    return currentUser;
  }
}
