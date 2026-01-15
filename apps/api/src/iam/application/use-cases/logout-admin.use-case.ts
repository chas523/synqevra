import { Injectable } from '@nestjs/common';
import { LogoutCommand } from '../dto/logout.command';
import { AdminRepository } from '../../domain/repositories/admin.repository';
import { AuthService } from '../auth/auth.service';
import { LogoutResult } from '../dto/logout.result';

@Injectable()
export class LogoutAdminUseCase {
  constructor(
    private readonly adminRepository: AdminRepository,
    private readonly tokenService: AuthService,
  ) {}

  async execute(command: LogoutCommand): Promise<LogoutResult> {
    const { userId, response } = command;

    await this.adminRepository.updateHashedRt(userId, null);
    this.tokenService.clearAuthCookies(response);

    return { success: true, message: 'Logged out successfully' };
  }
}
