import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchNotificationRequestsQuery } from './fetch-notification-requests.query';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from '../../../infrastructure/http/thingsboard.http.errors';
import { Inject, Logger } from '@nestjs/common';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { SysAdminAuthService } from '../../services/sysadmin-auth.service';

@QueryHandler(FetchNotificationRequestsQuery)
export class FetchNotificationRequestsQueryHandler
    implements
    IQueryHandler<
        FetchNotificationRequestsQuery,
        Result<any, ThingsboardApiException>
    > {
    private readonly logger = new Logger(FetchNotificationRequestsQueryHandler.name);

    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
        private readonly sysAdminAuthService: SysAdminAuthService,
    ) { }

    async execute(
        query: FetchNotificationRequestsQuery,
    ): Promise<Result<any, ThingsboardApiException>> {
        try {
            const sysAdminAccessToken =
                await this.sysAdminAuthService.getAccessToken();

            const response =
                await this.thingsboardApi.fetchNotificationRequests(
                    sysAdminAccessToken,
                    query.params,
                );

            return Ok(response);
        } catch (error) {
            this.logger.error('Error fetching notification requests', error);
            return Err(error as ThingsboardApiException);
        }
    }
}
