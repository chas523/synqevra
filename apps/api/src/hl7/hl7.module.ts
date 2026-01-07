import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ConnectionModule } from 'src/connection/connection.module';
import { HL7ToFHIRPipe } from './interface/pipes/hl7-to-fhir-pipe';
import { MedplumModule } from '../medplum/medplum.module';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from './infrastructure/constants/queue.constants';
import { FhirToMedplumSaveQueue } from './infrastructure/queues/fhir-to-medplum-save.queue';
import { CreateEncounterPv1UseCase } from './application/use-cases/create-encounter-pv1.use-case';
import { CreatePatientFromPidUseCase } from './application/use-cases/create-patient-pid.use-case';
import { PidToPatientMapper } from './infrastructure/mappers/pid-to-patient.mapper';
import { Pv1ToEncounterMapper } from './infrastructure/mappers/pv1-to-encounter.mapper';
import { PractitionerLookupService } from './application/services/practitioner-lookup.service';
import { Hl7ValidationPipe } from './interface/pipes/hl7-validation.pipe';
import { HL7Controller } from './interface/rest/hl7.controller';

@Module({
  imports: [
    ConfigModule,
    ConnectionModule,
    MedplumModule,

    //queue management
    //registers all application queues in one place for better maintainability
    BullModule.registerQueue({
      name: QUEUE_NAMES.HL7_PROCESSING,
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
  ],
  providers: [
    PractitionerLookupService,

    CreateEncounterPv1UseCase,
    CreatePatientFromPidUseCase,

    PidToPatientMapper,
    Pv1ToEncounterMapper,
    HL7ToFHIRPipe,
    Hl7ValidationPipe,
    FhirToMedplumSaveQueue,
  ],
  exports: [BullModule],
  controllers: [HL7Controller],
})
export class Hl7Module {}
