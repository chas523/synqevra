import { AuthService } from '../auth/auth.service';
import { RefreshTokensCommand } from '../dto/refresh-token.command';
import { RefreshTokensResult } from '../dto/refresh-token.result';
import * as argon2 from 'argon2';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class RefreshTokensUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: AuthService,
  ) {}

  async execute(command: RefreshTokensCommand): Promise<RefreshTokensResult> {
    const { userId, response } = command;

    const accessToken = await this.tokenService.generateAccessToken(userId);
    const refreshToken = await this.tokenService.generateRefreshToken(userId);
    const hashedRt = await argon2.hash(refreshToken);

    await this.userRepository.updateHashedRt(userId, hashedRt);

    this.tokenService.setTokenCookies(response, accessToken, refreshToken);

    return { id: userId, success: true };
  }
}
