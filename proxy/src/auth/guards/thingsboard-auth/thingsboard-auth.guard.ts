import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ThingsboardService } from 'src/thingsboard/thingsboard.service';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';

export interface RequestWithTbToken extends Request {
  tbAccessToken?: string;
}

@Injectable()
export class ThingsboardAuthGuard implements CanActivate {
  constructor(private readonly thingsboardService: ThingsboardService) {}

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
    const tokens = await this.thingsboardService.getTokens(user.id);
    let accessToken = tokens?.accessToken;

    //check expiration time (coded with jwt)
    const decoded: any = accessToken ? jwt.decode(accessToken) : null;
    const needRefresh = !decoded || this.isExpiredOrNear(decoded?.exp);
    console.log(
      'Token exp:',
      decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : 'N/A',
    );
    if (needRefresh) {
      console.log('needRefresh');
      //refresh
      try {
        const refreshedTokens = await this.thingsboardService.refresh(user.id);
        accessToken = refreshedTokens.accessToken;
      } catch {
        throw new UnauthorizedException(
          'ThingsBoard session expired. Please sign in again.',
        );
      }
    }

    //inject token to request to make it available later
    req.tbAccessToken = accessToken;
    return true;
  }
}
