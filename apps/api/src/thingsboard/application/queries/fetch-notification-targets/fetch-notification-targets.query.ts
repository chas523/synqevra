import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { NotificationTargetsResponse } from 'src/thingsboard/interface/rest/dtos/response/notification-target.response.dto';

export class FetchNotificationTargetsQuery extends Query<
    Result<NotificationTargetsResponse, ThingsboardApiException>
> { }
