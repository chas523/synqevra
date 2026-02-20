import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { NotificationRequestResponse } from 'src/thingsboard/interface/rest/dtos/response/notification-request.response.dto';
import { SendNotificationRequestDto } from 'src/thingsboard/interface/rest/dtos/request/send-notification.request.dto';

export class SendNotificationCommand extends Command<
    Result<NotificationRequestResponse, ThingsboardApiException>
> {
    constructor(
        public readonly accessToken: string,
        public readonly notificationRequest: SendNotificationRequestDto,
    ) {
        super();
    }
}
