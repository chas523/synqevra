import { Module } from '@nestjs/common';
import { UsersController } from './interface/rest/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './infrastructure/persistance/user.entity';
import { AuthController } from './interface/rest/auth.controller';
import { AuthService } from './application/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import refreshJwtConfig from '../config/refresh-jwt.config';
import { ThingsboardModule } from '../thingsboard/thingsboard.module';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { LogoutUserUseCase } from './application/use-cases/logout-user.use-case';
import { RefreshTokensUseCase } from './application/use-cases/refresh-token.use-case';
import { UserRepositoryAdapter } from './infrastructure/persistance/user.repository.adapter';
import { UserRepository } from './domain/repositories/user.repository';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { TokenGeneratorPort } from './application/ports/token-generator.port';
import { TokenGeneratorAdapter } from './infrastructure/security/token-generator.adapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    ThingsboardModule,
  ],
  controllers: [UsersController, AuthController],
  providers: [
    AuthService,

    CreateUserUseCase,
    RegisterUserUseCase,
    LoginUserUseCase,
    LogoutUserUseCase,
    RefreshTokensUseCase,

    { provide: UserRepository, useClass: UserRepositoryAdapter },
    { provide: TokenGeneratorPort, useClass: TokenGeneratorAdapter },
  ],
  exports: [AuthService, CreateUserUseCase, UserRepository, TokenGeneratorPort],
})
export class IamModule {}
