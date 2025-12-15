import { Inject } from '@nestjs/common';
import { Result, Ok, Err } from 'oxide.ts';
import { CreateActivationLinkCommand } from './create-activation-link.command';
import { ConfigService } from '@nestjs/config';
import { ConnectionService } from 'src/connection/connection.service';
import { SendEmailDto } from 'src/mailer/interface/rest/dtos/request/send-email.request.dto';
import { PendingUserStatus } from 'src/pending-user/domain/enums/status.enum';
import { EMAIL_PORT, EmailPort } from 'src/mailer/application/ports/email.port';
import {
  ActivationLinkUserNotFoundError,
  CreateActivationLinkError,
  EmailSendError,
} from 'src/mailer/domain/errors/mailer.errors';
import {
  CommandHandler,
  ICommandHandler,
  CommandBus,
  QueryBus,
} from '@nestjs/cqrs';
import { GetPendingUserByEmailQuery } from 'src/pending-user/application/queries/get-pending-user-by-email/get-pending-user-by-email.query';
import { UpdatePendingUserCommand } from 'src/pending-user/application/commands/update-pending-user/update-pending-user.command';

@CommandHandler(CreateActivationLinkCommand)
export class CreateActivationLinkCommandHandler
  implements
    ICommandHandler<
      CreateActivationLinkCommand,
      Result<void, CreateActivationLinkError>
    >
{
  constructor(
    private readonly configService: ConfigService,
    private readonly connectionService: ConnectionService,
    @Inject(EMAIL_PORT)
    private readonly emailPort: EmailPort,

    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(
    command: CreateActivationLinkCommand,
  ): Promise<Result<void, CreateActivationLinkError>> {
    try {
      const { firstname, lastname, email } = command;
      console.log('CreateActivationLinkCommandHandler execute called with:', {
        firstname,
        lastname,
        email,
      });
      const userResult = await this.queryBus.execute(
        new GetPendingUserByEmailQuery({ email }),
      );
      const user = userResult.unwrap();

      if (userResult.isErr() || !user) {
        return Err(new ActivationLinkUserNotFoundError(email));
      }

      const tokenResult = this.connectionService.createToken(
        user.getId().toString(),
      );
      const tokenPayloadEncoded = tokenResult.tokenPayloadEncoded;
      const hash = tokenResult.hash;

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      console.log('Updating user with activation token and expiry:', {
        hash,
        expiresAt,
      });
      await this.commandBus.execute(
        new UpdatePendingUserCommand({
          id: user.getId(),
          activationToken: hash,
          expiresAt: expiresAt,
          status: PendingUserStatus.PENDING,
        }),
      );

      const frontendBase =
        this.configService.get<string>('FRONTEND_BASE_URL') ||
        'https://app.example.com';
      const activationLink = `${frontendBase}/auth/activate?token=${encodeURIComponent(tokenPayloadEncoded)}`;

      const dto: SendEmailDto = {
        from: {
          name: 'MedBoard',
          address: 'admin@medboard.com',
        },
        recipients: [
          {
            name: `${firstname} ${lastname}`,
            address: email,
          },
        ],
        subject: 'Activate your MedBoard account',
        html: `
              <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 32px 24px; background: #fafbfc;">
                <h2 style="color: #2d8cf0;">Welcome to MedBoard!</h2>
                <p>Hi ${firstname},</p>
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

      await this.emailPort.sendEmail(dto);

      return Ok(undefined);
    } catch (error) {
      return Err(new EmailSendError((error as Error).message));
    }
  }
}
