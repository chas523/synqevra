import { Module, forwardRef } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ValidateGoogleUserUseCase } from './application/use-cases/validate-google-user.use-case';
import { UsersController } from './interface/rest/users.controller';
import { AdminController } from './interface/rest/admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './infrastructure/persistance/user.entity';
import { Admin } from './infrastructure/persistance/admin.entity';
import { ActivationLink } from './infrastructure/persistance/activation-link.entity';
import { Patient } from './infrastructure/persistance/patient.entity';
import { PatientMedplum } from './infrastructure/persistance/patient-medplum.entity';
import { AuthController } from './interface/rest/auth.controller';
import { AuthService } from './application/auth/auth.service';
import { AdminInitService } from './admin-init.service';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import refreshJwtConfig from '../config/refresh-jwt.config';
import { ThingsboardModule } from '../thingsboard/thingsboard.module';
import { ConnectionModule } from '../connection/connection.module';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { LogoutUserUseCase } from './application/use-cases/logout-user.use-case';
import { RefreshTokensUseCase } from './application/use-cases/refresh-token.use-case';
import { InvitePractitionerUseCase } from './application/use-cases/invite-practitioner.use-case';
import { UserRepositoryAdapter } from './infrastructure/persistance/user.repository.adapter';
import { ActivationLinkRepositoryAdapter } from './infrastructure/persistance/activation-link.repository.adapter';
import { UserRepository } from './domain/repositories/user.repository';
import { ActivationLinkRepository } from './domain/repositories/activation-link.repository';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { TokenGeneratorPort } from './application/ports/token-generator.port';
import { TokenGeneratorAdapter } from './infrastructure/security/token-generator.adapter';
import { EMAIL_PORT } from 'src/mailer/application/ports/email.port';
import { NodemailerAdapter } from 'src/mailer/infrastructure/mailer/nodemailer.adapter';
import { GetUserByTokenUseCase } from './application/use-cases/get-user-by-token.use-case';
import { LoginAdminUseCase } from './application/use-cases/login-admin.use-case';
import { LogoutAdminUseCase } from './application/use-cases/logout-admin.use-case';
import { AdminRepository } from './domain/repositories/admin.repository';
import { AdminRepositoryAdapter } from './infrastructure/persistance/admin.repository.adapter';
import { GetUserProfileUseCase } from './application/use-cases/get-user-profile.use-case';
import { PatientLoginUseCase } from './application/use-cases/patient-login.use-case';
import { PatientRepository } from './domain/repositories/patient.repository';
import { PatientRepositoryAdapter } from './infrastructure/persistance/patient.repository.adapter';
import { PatientMedplumRepository } from './domain/repositories/patient-medplum.repository';
import { PatientMedplumRepositoryAdapter } from './infrastructure/persistance/patient-medplum.repository.adapter';
import { PatientAuthGuard } from 'src/auth/guards/patient-auth/patient-auth.guard';
import { MedplumModule } from 'src/medplum/medplum.module';
import { PatientController } from './interface/rest/patient.controller';
import { GetPatientProfileUseCase } from './application/use-cases/get-patient-profile.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Admin,
      ActivationLink,
      Patient,
      PatientMedplum,
    ]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    CqrsModule,
    ThingsboardModule,
    forwardRef(() => ConnectionModule),
    forwardRef(() => MedplumModule),
  ],
  controllers: [
    UsersController,
    AuthController,
    AdminController,
    PatientController,
  ],
  providers: [
    AuthService,
    CreateUserUseCase,
    UpdateUserUseCase,
    RegisterUserUseCase,
    LoginUserUseCase,
    LoginAdminUseCase,
    LogoutUserUseCase,
    LogoutAdminUseCase,
    RefreshTokensUseCase,
    InvitePractitionerUseCase,
    GetUserByTokenUseCase,
    GetUserProfileUseCase,
    PatientLoginUseCase,
    GetPatientProfileUseCase,
    ValidateGoogleUserUseCase,
    { provide: UserRepository, useClass: UserRepositoryAdapter },
    { provide: AdminRepository, useClass: AdminRepositoryAdapter },
    { provide: TokenGeneratorPort, useClass: TokenGeneratorAdapter },
    { provide: PatientRepository, useClass: PatientRepositoryAdapter },
    {
      provide: PatientMedplumRepository,
      useClass: PatientMedplumRepositoryAdapter,
    },
    PatientAuthGuard,
    {
      provide: ActivationLinkRepository,
      useClass: ActivationLinkRepositoryAdapter,
    },
    {
      provide: EMAIL_PORT,
      useClass: NodemailerAdapter,
    },
    AdminInitService,
  ],
  exports: [
    AuthService,
    CreateUserUseCase,
    UpdateUserUseCase,
    GetUserByTokenUseCase,
    UserRepository,
    TokenGeneratorPort,
    ActivationLinkRepository,
    PatientRepository,
    PatientMedplumRepository,
    PatientAuthGuard,
    AdminInitService,
    ValidateGoogleUserUseCase,
  ],
})
export class IamModule {
  constructor(adminInitService: AdminInitService) {
    // This will trigger the onModuleInit lifecycle for AdminInitService
  }
}
