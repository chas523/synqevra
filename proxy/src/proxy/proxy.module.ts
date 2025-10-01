import { Module } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { ProxyController } from './proxy.controller';
import { HttpModule } from '@nestjs/axios';
import { MedplumService } from '../medplum/medplum.service';

@Module({
  imports: [
    HttpModule.register({
      // baseURL: process.env.MEDPLUM_URL ?? 'http://localhost:8103/',
      timeout: 10000,
      maxRedirects: 3,
    }),
  ],
  controllers: [ProxyController],
  providers: [ProxyService, MedplumService],
})
export class ProxyModule {}
