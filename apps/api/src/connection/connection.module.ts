import { forwardRef, Module } from '@nestjs/common';
import { ConnectionController } from './interface/rest/connection.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from './infrastructure/persistance/connection.entity';
import { HttpModule } from '@nestjs/axios';
import { PendingUserModule } from 'src/pending-user/pending-user.module';
import { IamModule } from '../iam/iam.module';
import { MedplumModule } from '../medplum/medplum.module';
import { ThingsboardModule } from '../thingsboard/thingsboard.module';
import { ValidateTokenUseCase } from './application/use-cases/validate-token.use-case';
import { InitialConnectionUseCase } from './application/use-cases/initial-connection.use-case';
import { InitialConnectionOrchestrator } from './application/initial-connection.orchestrator';
import { ConfirmPractitionerUseCase } from './application/use-cases/confirm-practitioner.use-case';
import { UnitOfWorkFactory } from './infrastructure/transaction/unit-of-work.factory';
import { ConnectionRepositoryAdapter } from './infrastructure/persistance/connection.repository.adapter';
import { RegisterMedplumUseCase } from '../medplum/application/use-cases/register-medplum.use-case';
import { MedplumRegistrationService } from '../medplum/application/services/medplum-registration.service';
import { ConnectionRepository } from './domain/repositories/connection.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Connection]),
    forwardRef(() => MedplumModule),
    HttpModule,
    PendingUserModule,
    IamModule,
    forwardRef(() => ThingsboardModule),
  ],
  controllers: [ConnectionController],
  providers: [
    MedplumRegistrationService,

    ValidateTokenUseCase,
    InitialConnectionUseCase,
    ConfirmPractitionerUseCase,
    RegisterMedplumUseCase,

    InitialConnectionOrchestrator,
    UnitOfWorkFactory,
    {
      provide: ConnectionRepository,
      useClass: ConnectionRepositoryAdapter,
    },
  ],
  exports: [
    ValidateTokenUseCase,
    InitialConnectionUseCase,
    ConfirmPractitionerUseCase,

    InitialConnectionOrchestrator,
    UnitOfWorkFactory,
    ConnectionRepository,
  ],
})
export class ConnectionModule {}
