import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProxyModule } from './proxy/proxy.module';
import { MedplumModule } from './medplum/medplum.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionModule } from './connection/connection.module';
import { UsersModule } from './users/users.module';
import dbConfig from './config/db.config';
import { ThingsboardModule } from './thingsboard/thingsboard.module';
import { MailerModule } from './mailer/mailer.module';
import { PendingUserModule } from './pending-user/pending-user.module';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { Hl7MapperModule } from './hl7-mapper/hl7-mapper.module';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { QueueModule } from './queue/queue.module';
import { PublicApiModule } from './public-api/public-api.module';

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
    CacheModule.register({
      isGlobal: true,
    }),

    QueueModule,
    ConnectionModule,
    UsersModule,
    ThingsboardModule,
    MailerModule,
    PendingUserModule,
    Hl7MapperModule,
    PublicApiModule,
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
