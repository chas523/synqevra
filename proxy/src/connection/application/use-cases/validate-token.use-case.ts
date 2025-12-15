import {
  Injectable,
  GoneException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PendingUserService } from '../../../pending-user/application/pending-user.service';
import { PendingUserStatus } from '../../../pending-user/domain/enums/status.enum';

@Injectable()
export class ValidateTokenUseCase {
  constructor(private readonly pendingUserService: PendingUserService) {}

  async execute(token: string): Promise<{ valid: boolean }> {
    const userId = this.extractUserIdFromToken(token);
    // service should be removed and changed to use-case or repository
    const pendingUser = await this.pendingUserService.getPendingUserById(
      Number(userId),
    );
    if (!pendingUser) {
      throw new NotFoundException('Pending user not found');
    }

    const hash = crypto.createHash('sha256').update(token).digest('hex');
    if (pendingUser.activationToken !== hash) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    if (pendingUser.expiresAt && pendingUser.expiresAt < new Date()) {
      throw new GoneException('Token expired');
    }

    if (pendingUser.status !== PendingUserStatus.PENDING) {
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
