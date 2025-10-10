import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as config from '@nestjs/config';
import jwtConfig from '../../config/jwt.config';
import { Inject, Injectable } from '@nestjs/common';
import { AuthJwtPayload } from '../types/auth-jwtPayload';
import { AuthService } from '../auth.service';
import type { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: config.ConfigType<typeof jwtConfig>,
    private readonly authService: AuthService,
  ) {
    if (!jwtConfiguration.secret) {
      throw new Error('JWT secret is not defined');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.['access_token'];
        },
      ]),
      secretOrKey: jwtConfiguration.secret,
      ignoreExpiration: false,
    });
  }

  validate(payload: AuthJwtPayload) {
    console.log('JWT payload:', payload);
    const userId = payload.sub;
    return this.authService.validateJwtUser(userId);
  }
}
