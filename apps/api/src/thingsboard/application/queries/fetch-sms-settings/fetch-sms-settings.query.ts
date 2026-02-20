import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';

import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { SmsSettingsDto } from 'src/thingsboard/interface/rest/dtos/response/sms-settings.response.dto';

export class FetchSmsSettingsQuery extends Query<
    Result<SmsSettingsDto, ThingsboardApiException>
> {
    constructor(public readonly accessToken: string) {
        super();
    }
}
