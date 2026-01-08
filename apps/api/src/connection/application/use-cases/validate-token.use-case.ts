import * as crypto from 'crypto';
import { PendingUserStatus } from '../../../pending-user/domain/enums/status.enum';
import {
  PENDING_USER_REPOSITORY_PORT,
  PendingUserRepositoryPort,
} from '../../../pending-user/application/ports/pending-user.repository.port';
import { ActivationLinkRepository } from 'src/iam/domain/repositories/activation-link.repository';
import { UserRepository } from 'src/iam/domain/repositories/user.repository';

import {
  Injectable,
  GoneException,
  NotFoundException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

type TokenType = 'pendingUser' | 'user' | 'session';

interface DecodedTokenPayload {
  type: TokenType;
  subjectId: string;
  randomBytes: string;
}

export class ValidateTokenResult {
  @ApiProperty({
    description: 'Whether the token is valid',
    example: true,
    type: Boolean,
  })
  valid: boolean;

  @ApiProperty({
    description: 'Type of token',
    enum: ['pendingUser', 'user', 'session'],
    example: 'pendingUser',
    type: String,
  })
  tokenType: TokenType;
}

@Injectable()
export class ValidateTokenUseCase {
  constructor(
    @Inject(PENDING_USER_REPOSITORY_PORT)
    private readonly pendingUserRepository: PendingUserRepositoryPort,
    @Inject(ActivationLinkRepository)
    private readonly activationLinkRepository: ActivationLinkRepository,
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(token: string): Promise<ValidateTokenResult> {
    const { type, subjectId } = this.extractPayloadFromToken(token);
    const hash = crypto.createHash('sha256').update(token).digest('hex');

    switch (type) {
      case 'pendingUser': {
        const pendingUser = await this.pendingUserRepository.findById(
          Number(subjectId),
        );
        if (!pendingUser) {
          throw new NotFoundException('Pending user not found');
        }
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
        return { valid: true, tokenType: 'pendingUser' };
      }

      case 'user': {
        const activationLink =
          await this.activationLinkRepository.findByToken(hash);
        if (!activationLink) {
          throw new UnauthorizedException('Invalid or expired token');
        }
        if (activationLink.expiresAt && activationLink.expiresAt < new Date()) {
          throw new GoneException('Token expired');
        }
        const user = await this.userRepository.getUserById(
          Number(activationLink.userId ?? subjectId),
        );
        if (!user) {
          throw new NotFoundException('User not found');
        }
        return { valid: true, tokenType: 'user' };
      }

      case 'session': {
        //future - for patient dashboard sessions
        return { valid: true, tokenType: 'session' };
      }

      default:
        throw new UnauthorizedException('Unsupported token type');
    }
  }

  extractPayloadFromToken(token: string): DecodedTokenPayload {
    let tokenPayload: string;
    try {
      tokenPayload = Buffer.from(token, 'base64url').toString();
    } catch {
      throw new UnauthorizedException('Invalid token format');
    }

    const parts = tokenPayload.split(':');

    if (parts.length < 3) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const [type, subjectId, ...rest] = parts;
    const randomBytes = rest.join(':');

    if (!['pendingUser', 'user', 'session'].includes(type)) {
      throw new UnauthorizedException('Invalid token type');
    }

    if (!subjectId) {
      throw new UnauthorizedException('Missing subject id');
    }

    return { type: type as TokenType, subjectId, randomBytes };
  }
}
