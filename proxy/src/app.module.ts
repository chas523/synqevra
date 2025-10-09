import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProxyModule } from './proxy/proxy.module';
import { MedplumModule } from './medplum/medplum.module';
import { ConfigModule } from '@nestjs/config';
import { ThingsboardModule } from './thingsboard/thingsboard.module';

@Module({
  imports: [
    ProxyModule,
    MedplumModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThingsboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
