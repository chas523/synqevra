import { Module } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { ProxyController } from './proxy.controller';
import { HttpModule } from '@nestjs/axios';
import { ConnectionModule } from '../connection/connection.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 3,
    }),
    ConnectionModule,
  ],
  controllers: [ProxyController],
  providers: [ProxyService],
  exports: [],
})
export class ProxyModule {}
