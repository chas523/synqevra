import { SentMessageInfo } from 'nodemailer';
import { SendEmailDto } from 'src/mailer/interface/rest/dtos/request/send-email.request.dto';

export const EMAIL_PORT = Symbol('EMAIL_PORT');

export abstract class EmailPort {
  abstract sendEmail(dto: SendEmailDto): Promise<SentMessageInfo>;
}
