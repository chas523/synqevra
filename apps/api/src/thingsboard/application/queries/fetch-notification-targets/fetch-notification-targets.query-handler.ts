import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchNotificationTargetsQuery } from './fetch-notification-targets.query';
import { Err, Ok, Result } from 'oxide.ts';
import { NotificationTargetsResponse } from '../../../interface/rest/dtos/response/notification-target.response.dto';
import { Inject, Logger } from '@nestjs/common';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { SysAdminAuthService } from '../../services/sysadmin-auth.service';

@QueryHandler(FetchNotificationTargetsQuery)
export class FetchNotificationTargetsQueryHandler
    implements
    IQueryHandler<
        FetchNotificationTargetsQuery,
        Result<NotificationTargetsResponse, ThingsboardApiException>
    > {
    private readonly logger = new Logger(
        FetchNotificationTargetsQueryHandler.name,
    );

    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApiPort: ThingsboardApiPort,
        private readonly sysAdminAuthService: SysAdminAuthService,
    ) { }

    async execute(
        query: FetchNotificationTargetsQuery,
    ): Promise<Result<NotificationTargetsResponse, ThingsboardApiException>> {
        try {
            // Get SysAdmin token
            const sysAdminToken = await this.sysAdminAuthService.getAccessToken();

            // Fetch notification targets
            const response = await this.thingsboardApiPort.fetchNotificationTargets(
                sysAdminToken,
            );

            this.logger.log(
                `Successfully fetched ${response.totalElements} notification targets`,
            );
            return Ok(response);
        } catch (error) {
            this.logger.error(
                `Failed to fetch notification targets: ${error.message}`,
            );
            return Err(
                error instanceof ThingsboardApiException
                    ? error
                    : new ThingsboardApiException(error.message, 500),
            );
        }
    }
}
