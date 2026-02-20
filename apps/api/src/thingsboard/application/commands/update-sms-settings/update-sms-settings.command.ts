import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { SmsSettingsDto } from 'src/thingsboard/interface/rest/dtos/response/sms-settings.response.dto';

export class UpdateSmsSettingsCommand extends Command<
    Result<SmsSettingsDto, ThingsboardApiException>
> {
    constructor(
        public readonly settings: SmsSettingsDto,
        public readonly accessToken: string,
    ) {
        super();
    }
}
