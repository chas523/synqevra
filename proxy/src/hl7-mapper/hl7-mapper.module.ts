import { Module } from '@nestjs/common';
// import { Hl7MapperService } from './hl7-mapper.service';
import { ConfigModule } from '@nestjs/config';
import { ConnectionModule } from 'src/connection/connection.module';
import { QueueModule } from '../queue/queue.module';
import { HL7ToFHIRPipe } from './pipes/hl7-to-fhir-pipe';
import { MedplumModule } from '../medplum/medplum.module';

@Module({
  imports: [ConfigModule, QueueModule, ConnectionModule, MedplumModule],
  providers: [HL7ToFHIRPipe],
  exports: [HL7ToFHIRPipe],
})
export class Hl7MapperModule {}
