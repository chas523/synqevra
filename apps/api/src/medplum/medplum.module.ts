import { forwardRef, Module } from '@nestjs/common';
import { MedplumController } from './interface/rest/medplum.controller';
import { Medplum } from './infrastructure/persistance/medplum.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionModule } from '../connection/connection.module';
import { ThingsboardModule } from '../thingsboard/thingsboard.module';
import { PatientUseCase } from './application/use-cases/patient.use-case';
import { DeviceUseCase } from './application/use-cases/device.use-case';
import { GetPractitionerListUseCase } from './application/use-cases/get-practitioner-list.use-case';
import { GetPractitionerByIdUseCase } from './application/use-cases/get-practitioner-by-id.use-case';
import { MedplumClientAdapter } from './infrastructure/medplum/medplum-client.adapter';
import { MedplumClientFactory } from './application/medplum-client.factory';
import { MedplumClientPort } from './application/ports/medplum-client.port';
import { MedplumRepository } from './domain/repositories/medplum.repository';
import { MedplumRepositoryAdapter } from './infrastructure/persistance/medplum.repository.adapter';
import { MedplumRollbackService } from './application/services/medplum-rollback.service';
import { MedplumRegistrationService } from './application/services/medplum-registration.service';
import { CreateMedplumTenantUseCase } from './application/use-cases/create-medplum-tenant.use-case';
import { CreateMedplumTenantOrchestrator } from './application/create-medplum-tenant.orchestrator';
import { PasswordGeneratorService } from './application/services/password-generator.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Medplum]),
    forwardRef(() => ConnectionModule),
    forwardRef(() => ThingsboardModule),
  ],
  controllers: [MedplumController],
  providers: [
    PatientUseCase,
    DeviceUseCase,
    GetPractitionerListUseCase,
    GetPractitionerByIdUseCase,

    MedplumRegistrationService,
    PasswordGeneratorService,
    CreateMedplumTenantUseCase,
    CreateMedplumTenantOrchestrator,

    MedplumClientFactory,
    MedplumClientAdapter,
    MedplumRollbackService,
    {
      provide: MedplumClientPort,
      useClass: MedplumClientAdapter,
    },
    {
      provide: MedplumRepository,
      useClass: MedplumRepositoryAdapter,
    },
  ],
  exports: [MedplumClientPort, MedplumClientFactory, MedplumRepository, MedplumRollbackService],
})
export class MedplumModule { }
