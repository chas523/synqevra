import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

export interface NotificationRequestsQueryParams {
    pageSize?: number;
    page?: number;
    sortProperty?: string;
    sortOrder?: string;
}

export class FetchNotificationRequestsQuery extends Query<
    Result<any, ThingsboardApiException>
> {
    constructor(
        public readonly accessToken: string,
        public readonly params: NotificationRequestsQueryParams,
    ) {
        super();
    }
}
