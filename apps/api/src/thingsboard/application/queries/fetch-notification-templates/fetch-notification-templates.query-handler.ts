import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchNotificationTemplatesQuery } from './fetch-notification-templates.query';
import { Err, Ok, Result } from 'oxide.ts';
import { NotificationTemplatesResponse } from '../../../interface/rest/dtos/response/notification-template.response.dto';
import { Inject, Logger } from '@nestjs/common';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { SysAdminAuthService } from '../../services/sysadmin-auth.service';

@QueryHandler(FetchNotificationTemplatesQuery)
export class FetchNotificationTemplatesQueryHandler
    implements
    IQueryHandler<
        FetchNotificationTemplatesQuery,
        Result<NotificationTemplatesResponse, ThingsboardApiException>
    > {
    private readonly logger = new Logger(
        FetchNotificationTemplatesQueryHandler.name,
    );

    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApiPort: ThingsboardApiPort,
        private readonly sysAdminAuthService: SysAdminAuthService,
    ) { }

    async execute(
        query: FetchNotificationTemplatesQuery,
    ): Promise<Result<NotificationTemplatesResponse, ThingsboardApiException>> {
        try {
            const sysAdminToken = await this.sysAdminAuthService.getAccessToken();

            const response = await this.thingsboardApiPort.fetchNotificationTemplates(
                sysAdminToken,
                query.params,
            );

            this.logger.log(
                `Successfully fetched ${response.totalElements} notification templates`,
            );
            return Ok(response);
        } catch (error) {
            this.logger.error(
                `Failed to fetch notification templates: ${error.message}`,
            );
            return Err(
                error instanceof ThingsboardApiException
                    ? error
                    : new ThingsboardApiException(error.message, 500),
            );
        }
    }
}
