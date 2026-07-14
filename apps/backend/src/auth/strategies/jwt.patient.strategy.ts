import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import jwtConfig from '../../config/jwt.config';
import { AuthService } from '../../iam/application/auth/auth.service';
import type { ConfigType } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { AuthJwtPayload } from '../types/auth-jwtPayload';
import { Role } from '../../iam/domain/enums/role.enum';

@Injectable()
export class JwtPatientStrategy extends PassportStrategy(
  Strategy,
  'jwt-patient',
) {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
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
      secretOrKey: jwtConfiguration.secret as string,
      ignoreExpiration: false,
    });
  }

  validate(payload: AuthJwtPayload) {
    if (payload.role !== Role.PATIENT) return null;
    const patientId = payload.sub;
    return this.authService.validateJwtPatient(patientId);
  }
}
