import {
  Injectable,
  GoneException,
  NotFoundException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { ActivationLinkRepository } from 'src/iam/domain/repositories/activation-link.repository';
import { UserRepository } from 'src/iam/domain/repositories/user.repository';

export interface UserByTokenResult {
  firstName: string;
  lastName: string;
  email: string;
}

@Injectable()
export class GetUserByTokenUseCase {
  constructor(
    @Inject(ActivationLinkRepository)
    private readonly activationLinkRepository: ActivationLinkRepository,
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(token: string): Promise<UserByTokenResult> {
    const hash = crypto.createHash('sha256').update(token).digest('hex');

    const activationLink =
      await this.activationLinkRepository.findByToken(hash);

    if (!activationLink) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (activationLink.expiresAt && activationLink.expiresAt < new Date()) {
      throw new GoneException('Token expired');
    }

    const user = await this.userRepository.getUserById(
      Number(activationLink.userId),
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
    };
  }
}
