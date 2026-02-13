import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { NotificationTargetsResponse } from 'src/thingsboard/interface/rest/dtos/response/notification-target.response.dto';

export interface NotificationTargetsQueryParams {
    pageSize?: number;
    page?: number;
    sortProperty?: string;
    sortOrder?: string;
}

export class FetchNotificationTargetsQuery extends Query<
    Result<NotificationTargetsResponse, ThingsboardApiException>
> {
    constructor(public readonly params: NotificationTargetsQueryParams = {}) {
        super();
    }
}
