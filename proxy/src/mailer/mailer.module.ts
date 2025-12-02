import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerService } from './mailer.service';
import { MailerController } from './mailer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConnectionModule } from 'src/connection/connection.module';
import { PendingUser } from 'src/pending-user/infrastructure/persistence/pending-user.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([PendingUser]),
    ConnectionModule,
  ],
  controllers: [MailerController],
  providers: [MailerService],
})
export class MailerModule {}
