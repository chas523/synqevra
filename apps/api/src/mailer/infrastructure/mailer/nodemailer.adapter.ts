import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailPort } from 'src/mailer/application/ports/email.port';
import { SendEmailDto } from 'src/mailer/interface/rest/dtos/request/send-email.request.dto';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { MailerError } from './mailer.errors';
import { SentMessageInfo } from 'nodemailer';

@Injectable()
export class NodemailerAdapter implements EmailPort {
  private readonly logger = new Logger(NodemailerAdapter.name);

  constructor(private configService: ConfigService) {}

  private mailTransport() {
    return nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });
  }

  async sendEmail(dto: SendEmailDto): Promise<SentMessageInfo> {
    const { from, recipients, subject, html } = dto;

    const transport = this.mailTransport();
    const options: Mail.Options = {
      from,
      to: recipients,
      subject,
      html,
    };
    try {
      return await transport.sendMail(options);
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      MailerError.createException('Failed to send email', error);
    }
  }
}
