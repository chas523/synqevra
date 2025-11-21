import { Module } from '@nestjs/common';
import { UsersService } from './application/users/users.service';
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
    UsersService,
    AuthService,
    CreateUserUseCase,
    RegisterUserUseCase,
    LoginUserUseCase,
    LogoutUserUseCase,
    RefreshTokensUseCase,
    UserRepositoryAdapter,
    { provide: UserRepository, useClass: UserRepositoryAdapter },
  ],
  exports: [UsersService, AuthService],
})
export class IamModule {}
