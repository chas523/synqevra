import { AuthService } from '../auth/auth.service';
import { LogoutCommand } from '../dto/logout.command';
import { LogoutResult } from '../dto/logout.result';
import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class LogoutUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: AuthService,
  ) {}

  async execute(command: LogoutCommand): Promise<LogoutResult> {
    const { userId, response } = command;

    await this.userRepository.updateHashedRt(userId, null);
    this.tokenService.clearAuthCookies(response);

    return { success: true, message: 'Logged out successfully' };
  }
}
