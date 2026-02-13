import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { NotificationTemplatesResponse } from 'src/thingsboard/interface/rest/dtos/response/notification-template.response.dto';

export interface NotificationTemplatesQueryParams {
    pageSize?: number;
    page?: number;
    sortProperty?: string;
    sortOrder?: string;
    notificationTypes?: string;
}

export class FetchNotificationTemplatesQuery extends Query<
    Result<NotificationTemplatesResponse, ThingsboardApiException>
> {
    constructor(public readonly params: NotificationTemplatesQueryParams = {}) {
        super();
    }
}
