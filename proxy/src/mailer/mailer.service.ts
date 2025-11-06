import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  PendingUser,
  PendingUserStatus,
} from '../entities/pending-user.entity';
import { SendEmailDto } from './dtos/send-email.dto';
import { MailRecipient } from './dtos/mail-recipient.dto';
import { ConnectionService } from 'src/connection/connection.service';

@Injectable()
export class MailerService {
  constructor(
    private readonly configService: ConfigService,
    private readonly connectionService: ConnectionService,
    @InjectRepository(PendingUser)
    private readonly pendingUserRepo: Repository<PendingUser>,
  ) {}
  mailTransport() {
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

  //generate activation link with user id
  async createActivationLink(recipient: MailRecipient) {
    const user = await this.pendingUserRepo.findOne({
      where: { email: recipient.email },
    });
    if (!user) {
      throw new Error('Pending user not found');
    }

    const { tokenPayloadEncoded, hash } = this.connectionService.createToken(
      user.id.toString(),
    );

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.pendingUserRepo.update(user.id, {
      activationToken: hash,
      expiresAt: expiresAt,
      status: PendingUserStatus.PENDING,
    });

    const frontendBase =
      this.configService.get<string>('FRONTEND_BASE_URL') ||
      'https://app.example.com';
    const activationLink = `${frontendBase}/auth/activate?token=${encodeURIComponent(tokenPayloadEncoded)}`;

    const dto: SendEmailDto = {
      from: {
        name: 'Thingsboard x Medplum',
        address: 'admin@thingsboardxmedplum.com',
      },
      recipients: [
        {
          name: `${recipient.firstName} ${recipient.lastName}`,
          address: recipient.email,
        },
      ],
      subject: 'Activate your Thingsboard x Medplum account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 32px 24px; background: #fafbfc;">
          <h2 style="color: #2d8cf0;">Welcome to Thingsboard x Medplum!</h2>
          <p>Hi ${recipient.firstName},</p>
          <p>Thank you for registering. Please activate your account by clicking the button below:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${activationLink}" style="background: #2d8cf0; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
              Activate Account
            </a>
          </div>
          <p>If the button above doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all;"><a href="${activationLink}">${activationLink}</a></p>
          <hr style="margin: 32px 0;">
          <p style="font-size: 12px; color: #888;">If you did not request this email, you can safely ignore it.</p>
        </div>
      `,
    };

    return await this.sendEmail(dto);
  }

  async sendEmail(emailDto: SendEmailDto) {
    const { from, recipients, subject, html } = emailDto;

    const transport = this.mailTransport();
    const options: Mail.Options = {
      from,
      to: recipients,
      subject,
      html,
    };
    try {
      return transport.sendMail(options);
    } catch (error) {
      console.log('Error: ', error);
    }
  }
}
