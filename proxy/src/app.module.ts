import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProxyModule } from './proxy/proxy.module';
import { MedplumModule } from './medplum/medplum.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionModule } from './connection/connection.module';
import { IamModule } from './iam/iam.module';
import dbConfig from './config/db.config';
import { ThingsboardModule } from './thingsboard/thingsboard.module';
import { MailerModule } from './mailer/mailer.module';
import { PendingUserModule } from './pending-user/pending-user.module';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ProxyModule,
    MedplumModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [dbConfig],
    }),
    TypeOrmModule.forRootAsync({ useFactory: dbConfig }),
    ThrottlerModule.forRoot({
      //modify later, for dev purposes it's set to 10
      throttlers: [{ limit: 10, ttl: seconds(10) }],
      errorMessage: 'Too many requests, please try again later.',
    }),
    ConnectionModule,
    IamModule,
    ThingsboardModule,
    MailerModule,
    PendingUserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
