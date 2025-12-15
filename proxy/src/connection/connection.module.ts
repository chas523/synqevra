import { forwardRef, Module } from '@nestjs/common';
import { ConnectionService } from './application/connection.service';
import { ConnectionController } from './interface/rest/connection.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from './infrastructure/persistance/connection.entity';
import { HttpModule } from '@nestjs/axios';
import { PendingUserModule } from 'src/pending-user/pending-user.module';
import { MedplumConnectionService } from '../medplum/application/medplum-connection.service';
import { IamModule } from '../iam/iam.module';
import { MedplumModule } from '../medplum/medplum.module';
import { ThingsboardModule } from '../thingsboard/thingsboard.module';
import { ValidateTokenUseCase } from './application/use-cases/validate-token.use-case';
import { InitialConnectionUseCase } from './application/use-cases/initial-connection.use-case';
import { InitialConnectionOrchestrator } from './application/initial-connection.orchestrator';
import { UnitOfWorkFactory } from './infrastructure/transaction/unit-of-work.factory';
import { ConnectionRepositoryAdapter } from './infrastructure/persistance/connection.repository.adapter';
import { RegisterMedplumUseCase } from '../medplum/application/use-cases/register-medplum.use-case';
import { MedplumRegistrationService } from '../medplum/application/services/medplum-registration.service';
import { ConnectionRepository } from './domain/repositories/connection.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Connection]),
    MedplumModule,
    HttpModule,
    PendingUserModule,
    IamModule,
    forwardRef(() => ThingsboardModule),
  ],
  controllers: [ConnectionController],
  providers: [
    ConnectionService,
    MedplumConnectionService,
    MedplumRegistrationService,

    ValidateTokenUseCase,
    InitialConnectionUseCase,
    RegisterMedplumUseCase,

    InitialConnectionOrchestrator,
    UnitOfWorkFactory,
    {
      provide: ConnectionRepository,
      useClass: ConnectionRepositoryAdapter,
    },
  ],
  exports: [
    ConnectionService,
    MedplumConnectionService,

    ValidateTokenUseCase,
    InitialConnectionUseCase,

    InitialConnectionOrchestrator,
    UnitOfWorkFactory,
    ConnectionRepository,
  ],
})
export class ConnectionModule {}
