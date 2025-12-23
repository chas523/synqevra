import { Module } from '@nestjs/common';
import { PostTelemetryUseCase } from './application/use-cases/post-telemetry.use-case';
import { ProxyController } from './interface/rest/proxy.controller';
import { HttpModule } from '@nestjs/axios';
import { MedplumModule } from '../medplum/medplum.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 3,
    }),
    MedplumModule,
  ],
  controllers: [ProxyController],
  providers: [PostTelemetryUseCase],
})
export class ProxyModule {}
