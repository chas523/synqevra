import { ICommand } from '@nestjs/cqrs';
import { MailSettingsDto } from 'src/thingsboard/interface/rest/dtos/response/mail-settings.response.dto';

export class UpdateMailSettingsCommand implements ICommand {
  constructor(
    public readonly settings: MailSettingsDto,
    public readonly accessToken: string,
  ) {}
}
