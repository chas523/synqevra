import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { NotificationRulesResponse } from 'src/thingsboard/interface/rest/dtos/response/notification-rule.response.dto';

export interface NotificationRulesQueryParams {
    pageSize?: number;
    page?: number;
    sortProperty?: string;
    sortOrder?: string;
}

export class FetchNotificationRulesQuery extends Query<
    Result<NotificationRulesResponse, ThingsboardApiException>
> {
    constructor(public readonly params: NotificationRulesQueryParams = {}) {
        super();
    }
}
