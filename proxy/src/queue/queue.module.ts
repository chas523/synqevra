import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from './constants/queue.constants';
import { FhirToMedplumSaveQueue } from './queues/fhir-to-medplum-save.queue';
import { ConnectionModule } from '../connection/connection.module';

//centralized queue management module
//registers all application queues in one place for better maintainability

@Module({
  imports: [
    ConnectionModule,
    BullModule.registerQueue({
      name: QUEUE_NAMES.HL7_PROCESSING,
    }),
    //add more queues
    // Global BullMQ configuration
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
  ],
  providers: [FhirToMedplumSaveQueue],
  exports: [BullModule],
})
export class QueueModule {}
