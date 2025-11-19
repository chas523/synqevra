import { Module } from '@nestjs/common';
import { PublicApiController } from './public-api.controller';
import { Hl7MapperModule } from '../hl7-mapper/hl7-mapper.module';
import { QueueModule } from '../queue/queue.module';
import { CacheModule } from '@nestjs/cache-manager';
import { MedplumModule } from 'src/medplum/medplum.module';
@Module({
  imports: [
    Hl7MapperModule,
    QueueModule,
    MedplumModule,
    // Global Cache configuration
  ],
  controllers: [PublicApiController],
})
export class PublicApiModule {}
