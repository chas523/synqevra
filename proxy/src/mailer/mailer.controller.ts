import { Body, Controller, Post } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { Public } from 'src/auth/decorators/public.decorator';
import type { MailRecipient } from './dtos/mail-recipient.dto';
import type { SendEmailDto } from './dtos/send-email.dto';

@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Public()
  @Post('/send-email')
  async sendMail(@Body() emailDto: SendEmailDto) {
    return await this.mailerService.sendEmail(emailDto);
  }

  @Public()
  @Post('/email-activation-link')
  async emailActivationLink(@Body() recipient: MailRecipient) {
    return await this.mailerService.createActivationLink(recipient);
  }
}
