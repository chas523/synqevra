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
    ConnectionModule,
    UsersModule,
    ThingsboardModule,
    MailerModule,
    PendingUserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
