import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectionModule } from 'src/connection/connection.module';
import { PendingUser } from 'src/pending-user/infrastructure/persistence/pending-user.entity';
import { CreateActivationLinkCommandHandler } from './application/commands/create-activation-link/create-activation-link.command-handler';
import { EMAIL_PORT } from './application/ports/email.port';
import { NodemailerAdapter } from './infrastructure/mailer/nodemailer.adapter';
import { PendingUserModule } from 'src/pending-user/pending-user.module';
import { MailerController } from './interface/rest/mailer.controller';
import { IamModule } from '../iam/iam.module';

const commandHandlers = [CreateActivationLinkCommandHandler];

@Module({
  imports: [
    ConfigModule,
    CqrsModule,
    TypeOrmModule.forFeature([PendingUser]),
    ConnectionModule,
    PendingUserModule,
    IamModule,
  ],
  controllers: [MailerController],
  providers: [
    ...commandHandlers,
    {
      provide: EMAIL_PORT,
      useClass: NodemailerAdapter,
    },
  ],
})
export class MailerModule {}
