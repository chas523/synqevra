import { Injectable } from '@nestjs/common';
import { AdminRepository } from '../../domain/repositories/admin.repository';
import { AuthService } from '../auth/auth.service';
import { LoginResult } from '../dto/login.result';
import { LoginCommand } from '../dto/login.command';
import * as argon2 from 'argon2';

@Injectable()
export class LoginAdminUseCase {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly tokenService: AuthService,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    const { userId, role, response } = command;
    const accessToken = await this.tokenService.generateAccessToken(userId);
    const refreshToken = await this.tokenService.generateRefreshToken(userId);
    const hashedRt = await argon2.hash(refreshToken);

    await this.adminRepository.updateHashedRt(userId, hashedRt);

    this.tokenService.setTokenCookies(response, accessToken, refreshToken);

    return { id: userId, role, success: true };
  }
}
