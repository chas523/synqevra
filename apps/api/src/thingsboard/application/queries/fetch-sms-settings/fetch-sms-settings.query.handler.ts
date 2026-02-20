import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { FetchSmsSettingsQuery } from './fetch-sms-settings.query';
import { SmsSettingsDto } from 'src/thingsboard/interface/rest/dtos/response/sms-settings.response.dto';
import { ConfigService } from '@nestjs/config';

@QueryHandler(FetchSmsSettingsQuery)
export class FetchSmsSettingsQueryHandler
    implements
    IQueryHandler<
        FetchSmsSettingsQuery,
        Result<SmsSettingsDto, ThingsboardApiException>
    > {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
    ) { }

    async execute(
        query: FetchSmsSettingsQuery,
    ): Promise<Result<SmsSettingsDto, ThingsboardApiException>> {
        try {
            const settings = await this.thingsboardApi.fetchSmsSettings(
                query.accessToken,
            );

            return Ok(settings);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
