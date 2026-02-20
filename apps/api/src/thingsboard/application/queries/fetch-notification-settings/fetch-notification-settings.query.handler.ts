import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { FetchNotificationSettingsQuery } from './fetch-notification-settings.query';
import { NotificationSettingsDto } from 'src/thingsboard/interface/rest/dtos/response/notification-settings.response.dto';
import { ConfigService } from '@nestjs/config';

@QueryHandler(FetchNotificationSettingsQuery)
export class FetchNotificationSettingsQueryHandler
    implements
    IQueryHandler<
        FetchNotificationSettingsQuery,
        Result<NotificationSettingsDto, ThingsboardApiException>
    > {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
    ) { }

    async execute(
        query: FetchNotificationSettingsQuery,
    ): Promise<Result<NotificationSettingsDto, ThingsboardApiException>> {
        try {
            const settings = await this.thingsboardApi.fetchNotificationSettings(
                query.accessToken,
            );

            return Ok(settings);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
