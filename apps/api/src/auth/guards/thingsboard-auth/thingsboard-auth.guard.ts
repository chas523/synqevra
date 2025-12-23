import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';
import {
  THINGSBOARD_REPOSITORY_PORT,
  ThingsboardRepositoryPort,
} from '../../../thingsboard/application/ports/thingsboard.repository.port';
import { CommandBus } from '@nestjs/cqrs';
import { RefreshTokenCommand } from '../../../thingsboard/application/commands/refresh-token/refresh-token.command';
import {
  ExpiredTokenError,
  ThingsboardConnectionNotFoundError,
  TokenRefreshError,
} from '../../../thingsboard/domain/errors/thingsboard.errors';

export interface RequestWithTbToken extends Request {
  tbAccessToken?: string;
}

@Injectable()
export class ThingsboardAuthGuard implements CanActivate {
  constructor(
    @Inject(THINGSBOARD_REPOSITORY_PORT)
    private readonly repositoryPort: ThingsboardRepositoryPort,
    private readonly commandBus: CommandBus,
  ) {}

  //skew sec - we treat token as expired 45 seconds before it actually expires
  private isExpiredOrNear(exp?: number, skewSec = 45): boolean {
    if (!exp) return true;
    const nowSec = Math.floor(Date.now() / 1000);
    return exp <= nowSec + skewSec;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithTbToken>();
    const user = req.user as { id: number } | undefined;
    if (!user?.id) throw new UnauthorizedException('User not authenticated');
    //get token from our db
    const tokens = await this.repositoryPort.getTokens(user.id);
    let accessToken = tokens?.getAccessToken();

    //check expiration time (coded with jwt)
    const decoded: any = accessToken ? jwt.decode(accessToken) : null;
    const needRefresh = !decoded || this.isExpiredOrNear(decoded?.exp);
    console.log(
      'Token exp:',
      decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : 'N/A',
    );
    if (needRefresh) {
      const result = await this.commandBus.execute(
        new RefreshTokenCommand(user.id),
      );

      if (result.isErr()) {
        this.handleRefreshError(result.unwrapErr());
      }
      accessToken = result.unwrap().accessToken;
    }

    //inject token to request to make it available later
    req.tbAccessToken = accessToken;
    return true;
  }

  private handleRefreshError(error: Error): never {
    if (error instanceof ExpiredTokenError) {
      throw new UnauthorizedException(error.message);
    }
    if (error instanceof TokenRefreshError) {
      throw new BadRequestException(error.message);
    }
    if (error instanceof ThingsboardConnectionNotFoundError) {
      throw new NotFoundException(error.message);
    }
    throw new InternalServerErrorException('Failed to refresh token');
  }
}
