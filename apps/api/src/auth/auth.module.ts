import { Module } from '@nestjs/common';
import { LocalStrategy } from './strategies/local.strategy';
import { LocalStrategy as LocalAdminStrategy } from './strategies/local.admin.strategy';
import { LocalPatientStrategy } from './strategies/local.patient.strategy';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import refreshJwtConfig from '../config/refresh-jwt.config';
import { RefreshJwtStrategy } from './strategies/refresh.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from './guards/roles/roles.guard';
import { IamModule } from '../iam/iam.module';
import { ThingsboardModule } from '../thingsboard/thingsboard.module';
import { JwtAdminStrategy } from './strategies/jwt.admin.strategy';
import { RefreshAdminStrategy } from './strategies/refresh.admin.strategy';
import { JwtPatientStrategy } from './strategies/jwt.patient.strategy';
import googleOAuthConfig from '../config/google-oauth.config';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    ConfigModule.forFeature(googleOAuthConfig),
    IamModule,
    ThingsboardModule,
  ],
  providers: [
    LocalStrategy,
    LocalAdminStrategy,
    LocalPatientStrategy,
    JwtStrategy,
    RefreshJwtStrategy,
    JwtAdminStrategy,
    RefreshAdminStrategy,
    JwtPatientStrategy,
    GoogleStrategy,
    // global guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AuthModule { }
