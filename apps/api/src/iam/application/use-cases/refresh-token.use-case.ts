import { AuthService } from '../auth/auth.service';
import { RefreshTokensCommand } from '../dto/refresh-token.command';
import { RefreshTokensResult } from '../dto/refresh-token.result';
import * as argon2 from 'argon2';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';
import { AdminRepository } from '../../domain/repositories/admin.repository';
import { ConnectionRepository } from '../../../connection/domain/repositories/connection.repository';
import { Role } from '../../domain/enums/role.enum';

@Injectable()
export class RefreshTokensUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly adminRepository: AdminRepository,
    private readonly connectionRepository: ConnectionRepository,
    private readonly tokenService: AuthService,
  ) { }

  async execute(command: RefreshTokensCommand): Promise<RefreshTokensResult> {
    const { userId, response } = command;

    const connection = await this.connectionRepository.getConnectionByUserId(userId);
    if (!connection || !connection.role) {
      throw new UnauthorizedException('User role not found');
    }

    const role = connection.role;

    const accessToken = await this.tokenService.generateAccessToken(userId, role);
    const refreshToken = await this.tokenService.generateRefreshToken(userId, role);
    const hashedRt = await argon2.hash(refreshToken);

    await this.userRepository.updateHashedRt(userId, hashedRt);

    this.tokenService.setTokenCookies(response, accessToken, refreshToken);

    return { id: userId, success: true };
  }

  async executeForAdmin(
    command: RefreshTokensCommand,
  ): Promise<RefreshTokensResult> {
    const { userId, response } = command;
    const role = Role.ADMIN;

    const accessToken = await this.tokenService.generateAccessToken(userId, role);
    const refreshToken = await this.tokenService.generateRefreshToken(userId, role);
    const hashedRt = await argon2.hash(refreshToken);

    await this.adminRepository.updateHashedRt(userId, hashedRt);

    this.tokenService.setTokenCookies(response, accessToken, refreshToken);

    return { id: userId, success: true };
  }
}
