import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchNotificationRulesQuery } from './fetch-notification-rules.query';
import { Err, Ok, Result } from 'oxide.ts';
import { NotificationRulesResponse } from '../../../interface/rest/dtos/response/notification-rule.response.dto';
import { Inject, Logger } from '@nestjs/common';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';


@QueryHandler(FetchNotificationRulesQuery)
export class FetchNotificationRulesQueryHandler
    implements
    IQueryHandler<
        FetchNotificationRulesQuery,
        Result<NotificationRulesResponse, ThingsboardApiException>
    > {
    private readonly logger = new Logger(
        FetchNotificationRulesQueryHandler.name,
    );

    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApiPort: ThingsboardApiPort,
    ) { }

    async execute(
        query: FetchNotificationRulesQuery,
    ): Promise<Result<NotificationRulesResponse, ThingsboardApiException>> {
        try {
            const response = await this.thingsboardApiPort.fetchNotificationRules(
                query.accessToken,
                query.params,
            );

            this.logger.log(
                `Successfully fetched ${response.totalElements} notification rules`,
            );
            return Ok(response);
        } catch (error) {
            this.logger.error(
                `Failed to fetch notification rules: ${error.message}`,
            );
            return Err(
                error instanceof ThingsboardApiException
                    ? error
                    : new ThingsboardApiException(error.message, 500),
            );
        }
    }
}
