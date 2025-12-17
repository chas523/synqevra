import {
  Injectable,
  GoneException,
  NotFoundException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PendingUserStatus } from '../../../pending-user/domain/enums/status.enum';
import {
  PENDING_USER_REPOSITORY_PORT,
  PendingUserRepositoryPort,
} from '../../../pending-user/application/ports/pending-user.repository.port';

@Injectable()
export class ValidateTokenUseCase {
  constructor(
    @Inject(PENDING_USER_REPOSITORY_PORT)
    private readonly pendingUserRepository: PendingUserRepositoryPort,
  ) {}

  async execute(token: string): Promise<{ valid: boolean }> {
    const userId = this.extractUserIdFromToken(token);
    const pendingUser = await this.pendingUserRepository.findById(
      Number(userId),
    );
    
    if (!pendingUser) {
      throw new NotFoundException('Pending user not found');
    }

    const hash = crypto.createHash('sha256').update(token).digest('hex');
    if (pendingUser.getActivationToken() !== hash) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    if (
      pendingUser.getExpiresAt() &&
      pendingUser.getExpiresAt()! < new Date()
    ) {
      throw new GoneException('Token expired');
    }

    if (pendingUser.getStatus() !== PendingUserStatus.PENDING) {
      throw new GoneException('Token already used or invalid status');
    }
    return { valid: true };
  }

  extractUserIdFromToken(token: string): string {
    let tokenPayload: string;
    try {
      tokenPayload = Buffer.from(token, 'base64url').toString();
    } catch {
      throw new UnauthorizedException('Invalid token format');
    }
    const parts = tokenPayload.split(':');
    if (parts.length !== 2) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return parts[1];
  }
}
