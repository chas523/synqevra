import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { NotificationSettingsDto } from 'src/thingsboard/interface/rest/dtos/response/notification-settings.response.dto';

export class UpdateNotificationSettingsCommand extends Command<
    Result<NotificationSettingsDto, ThingsboardApiException>
> {
    constructor(
        public readonly settings: NotificationSettingsDto,
        public readonly accessToken: string,
    ) {
        super();
    }
}
