import {
  BadRequestException,
  Body,
  Controller,
  HttpStatus,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { Public } from '../../../auth/decorators/public.decorator';
import { MailRecipient } from './dtos/request/mail-recipient.request.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateActivationLinkCommand } from '../../application/commands/create-activation-link/create-activation-link.command';

import { match, Result } from 'oxide.ts';
import {
  ActivationLinkUserNotFoundError,
  CreateActivationLinkError,
  EmailSendError,
} from '../../domain/errors/mailer.errors';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

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
  @Public()
  @Post('/email-activation-link')
  @ApiOperation({
    summary: 'Send activation link via email',
    description:
      'Send an account activation link to the provided email address. The link will be used to activate the user/practitioner/other account.',
  })
  @ApiBody({ type: MailRecipient })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Activation link sent successfully to the email',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'User not found with provided email or email sending failed',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'An unexpected error occurred while sending the email',
  })
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
