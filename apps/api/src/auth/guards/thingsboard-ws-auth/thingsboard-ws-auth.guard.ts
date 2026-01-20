import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import {
  THINGSBOARD_REPOSITORY_PORT,
  ThingsboardRepositoryPort,
} from '../../../thingsboard/application/ports/thingsboard.repository.port';
import { CommandBus } from '@nestjs/cqrs';
import { RefreshTokenCommand } from '../../../thingsboard/application/commands/refresh-token/refresh-token.command';
import { Socket } from 'socket.io';
import { AuthJwtPayload } from 'src/auth/types/auth-jwtPayload';

export interface SocketWithUser extends Socket {
  user?: { id: number };
  tbAccessToken?: string;
}

@Injectable()
export class ThingsboardWsAuthGuard implements CanActivate {
  constructor(
    @Inject(THINGSBOARD_REPOSITORY_PORT)
    private readonly repositoryPort: ThingsboardRepositoryPort,
    private readonly commandBus: CommandBus,
  ) {}

  private isExpiredOrNear(exp?: number, skewSec = 45): boolean {
    if (!exp) return true;
    const nowSec = Math.floor(Date.now() / 1000);
    return exp <= nowSec + skewSec;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<SocketWithUser>();

    // Get token from handshake cookies
    const cookies = client.handshake.headers.cookie;

    if (!cookies) {
      throw new UnauthorizedException('No cookies found');
    }

    // Parse cookies to get access token
    const accessTokenMatch = cookies.match(/access_token=([^;]+)/);
    const accessToken = accessTokenMatch ? accessTokenMatch[1] : null;

    if (!accessToken) {
      throw new UnauthorizedException('Access token not found in cookies');
    }

    // Decode JWT to get user ID
    const decoded = jwt.decode(accessToken);

    if (!decoded || typeof decoded === 'string' || !decoded.sub) {
      throw new UnauthorizedException('Invalid token format');
    }

    const payload = decoded as unknown as AuthJwtPayload;
    const userId = payload.sub;

    // Get token from DB
    const tokens = await this.repositoryPort.getTokens(userId);
    let freshAccessToken = tokens?.getAccessToken();

    // Check expiration
    const decodedDb: any = freshAccessToken
      ? jwt.decode(freshAccessToken)
      : null;
    const needRefresh = !decodedDb || this.isExpiredOrNear(decodedDb?.exp);

    if (needRefresh) {
      const result = await this.commandBus.execute(
        new RefreshTokenCommand(userId),
      );

      if (result.isErr()) {
        throw new UnauthorizedException('Token refresh failed');
      }
      freshAccessToken = result.unwrap().accessToken;
    }

    // Store token and user on socket for later use
    client.tbAccessToken = freshAccessToken;
    client.user = { id: userId };
    return true;
  }
}
