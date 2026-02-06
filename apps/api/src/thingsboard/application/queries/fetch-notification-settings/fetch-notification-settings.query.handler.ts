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
        private readonly configService: ConfigService,
    ) { }

    private get THINGSBOARD_SYSADMIN_EMAIL(): string {
        return this.configService.getOrThrow<string>('THINGSBOARD_SYSADMIN_EMAIL');
    }

    private get THINGSBOARD_SYSADMIN_PASSWORD(): string {
        return this.configService.getOrThrow<string>(
            'THINGSBOARD_SYSADMIN_PASSWORD',
        );
    }

    async execute(
        _: FetchNotificationSettingsQuery,
    ): Promise<Result<NotificationSettingsDto, ThingsboardApiException>> {
        try {
            const loginResponse = await this.thingsboardApi.loginToSysadminAccount(
                this.THINGSBOARD_SYSADMIN_EMAIL,
                this.THINGSBOARD_SYSADMIN_PASSWORD,
            );

            const settings = await this.thingsboardApi.fetchNotificationSettings(
                loginResponse.token,
            );

            return Ok(settings);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
