import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { ConfigType } from '@nestjs/config';
import { Inject, Injectable } from '@nestjs/common';
import { AuthJwtPayload } from '../types/auth-jwtPayload';
import refreshJwtConfig from '../../config/refresh-jwt.config';
import type { Request } from 'express';
import { AuthService } from '../../iam/application/auth/auth.service';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    readonly tokenConfiguration: ConfigType<typeof refreshJwtConfig>,
    private readonly authService: AuthService,
  ) {
    if (!tokenConfiguration.secret) {
      throw new Error('Refresh secret is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.['refresh_token'];
        },
      ]),
      secretOrKey: tokenConfiguration.secret,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: AuthJwtPayload) {
    const refreshToken = req.cookies?.['refresh_token'];
    const userId = payload.sub;

    if (!refreshToken || typeof refreshToken !== 'string') {
      return null;
    }

    return this.authService.validateRefreshToken(userId, refreshToken);
  }
}
