import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { LoginCommand } from '../dto/login.command';
import { LoginResult } from '../dto/login.result';
import * as argon2 from 'argon2';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: AuthService,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    const { userId, role, response } = command;

    const accessToken = await this.tokenService.generateAccessToken(userId);
    const refreshToken = await this.tokenService.generateRefreshToken(userId);
    const hashedRt = await argon2.hash(refreshToken);

    await this.userRepository.updateHashedRt(userId, hashedRt);

    this.tokenService.setTokenCookies(response, accessToken, refreshToken);

    return { id: userId, role, success: true };
  }
}
