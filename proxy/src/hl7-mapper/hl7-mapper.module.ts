import { Module } from '@nestjs/common';
import { Hl7MapperService } from './hl7-mapper.service';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { ConnectionModule } from 'src/connection/connection.module';

@Module({
  imports: [
    ConfigModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        //password: process.env.REDIS_PASSWORD || undefined,
      },
    }),
    BullModule.registerQueue({
      name: 'hl7-processing',
    }),
    ConnectionModule,
  ],
  providers: [Hl7MapperService],
  exports: [BullModule, Hl7MapperService],
})
export class Hl7MapperModule {}
