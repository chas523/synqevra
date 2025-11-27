import { forwardRef, Module } from '@nestjs/common';
import { ConnectionService } from './application/connection.service';
import { ConnectionController } from './interface/rest/connection.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from './infrastructure/persistance/connection.entity';
import { HttpModule } from '@nestjs/axios';
import { PendingUserModule } from 'src/pending-user/pending-user.module';
import { MedplumConnectionService } from './application/medplum-connection.service';
import { IamModule } from '../iam/iam.module';
import { MedplumModule } from '../medplum/medplum.module';
import { ThingsboardModule } from '../thingsboard/thingsboard.module';
import { ValidateTokenUseCase } from './application/use-cases/validate-token.use-case';
import { InitialConnectionUseCase } from './application/use-cases/initial-connection.use-case';
import { InitialConnectionOrchestrator } from './application/initial-connection.orchestrator';
import { UnitOfWorkFactory } from './infrastructure/transaction/unit-of-work.factory';
import { ConnectionRepositoryAdapter } from './infrastructure/persistance/connection.repository.adapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([Connection]),
    HttpModule,
    PendingUserModule,
    IamModule,
    forwardRef(() => MedplumModule),
    forwardRef(() => ThingsboardModule),
  ],
  controllers: [ConnectionController],
  providers: [
    ConnectionService,
    MedplumConnectionService,
    ValidateTokenUseCase,
    InitialConnectionUseCase,
    InitialConnectionOrchestrator,
    UnitOfWorkFactory,
    ConnectionRepositoryAdapter,
  ],
  exports: [
    ConnectionService,
    MedplumConnectionService,
    ValidateTokenUseCase,
    InitialConnectionUseCase,
    InitialConnectionOrchestrator,
    UnitOfWorkFactory,
    ConnectionRepositoryAdapter,
  ],
})
export class ConnectionModule {}
