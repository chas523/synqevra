import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';

import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { NotificationSettingsDto } from 'src/thingsboard/interface/rest/dtos/response/notification-settings.response.dto';

export class FetchNotificationSettingsQuery extends Query<
    Result<NotificationSettingsDto, ThingsboardApiException>
> {
    constructor(public readonly accessToken: string) {
        super();
    }
}
