import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerService } from './mailer.service';
import { MailerController } from './mailer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PendingUser } from 'src/entities/pending-user.entity';
import { ConnectionModule } from 'src/connection/connection.module';

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
