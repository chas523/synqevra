import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';

import { Public } from 'src/auth/decorators/public.decorator';
import { MailRecipient } from './dtos/request/mail-recipient.request.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateActivationLinkCommand } from 'src/mailer/application/commands/create-activation-link/create-activation-link.command';
import {
  ActivationLinkUserNotFoundError,
  CreateActivationLinkError,
  EmailSendError,
} from 'src/mailer/domain/errors/mailer.errors';
import { match, Result } from 'oxide.ts';

@Controller('mailer')
export class MailerController {
  constructor(private readonly commandBus: CommandBus) {}

  // @Public()
  // @Post('/send-email')
  // async sendMail(@Body() emailDto: SendEmailDto) {
  //   return await this.mailerService.sendEmail(emailDto);
  // }

  @Public()
  @Post('/email-activation-link')
  async emailActivationLink(@Body() recipient: MailRecipient) {
    const result: Result<void, CreateActivationLinkError> =
      await this.commandBus.execute(
        new CreateActivationLinkCommand({
          email: recipient.email,
          firstname: recipient.firstName,
          lastname: recipient.lastName,
        }),
      );

    return match(result, {
      Ok: () => ({ message: 'Activation link sent successfully' }),
      Err: (error: CreateActivationLinkError) => {
        if (error instanceof ActivationLinkUserNotFoundError) {
          throw new BadRequestException(error.message);
        }
        if (error instanceof EmailSendError) {
          throw new BadRequestException(error.message);
        }
        throw new InternalServerErrorException('An unexpected error occurred');
      },
    });
  }
}
