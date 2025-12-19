import { forwardRef, Module } from '@nestjs/common';
import { MedplumController } from './interface/rest/medplum.controller';
import { Medplum } from './infrastructure/persistance/medplum.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionModule } from '../connection/connection.module';
import { PatientUseCase } from './application/use-cases/patient.use-case';
import { DeviceUseCase } from './application/use-cases/device.use-case';
import { MedplumClientAdapter } from './infrastructure/medplum/medplum-client.adapter';
import { MedplumClientFactory } from './application/medplum-client.factory';
import { MedplumClientPort } from './application/ports/medplum-client.port';
import { MedplumRepository } from './domain/repositories/medplum.repository';
import { MedplumRepositoryAdapter } from './infrastructure/persistance/medplum.repository.adapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([Medplum]),
    forwardRef(() => ConnectionModule),
  ],
  controllers: [MedplumController],
  providers: [
    PatientUseCase,
    DeviceUseCase,

    MedplumClientFactory,
    MedplumClientAdapter,
    {
      provide: MedplumClientPort,
      useClass: MedplumClientAdapter,
    },
    {
      provide: MedplumRepository,
      useClass: MedplumRepositoryAdapter,
    },
  ],
  exports: [MedplumClientPort, MedplumClientFactory, MedplumRepository],
})
export class MedplumModule {}
