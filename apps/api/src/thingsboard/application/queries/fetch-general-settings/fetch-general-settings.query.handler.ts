import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { FetchGeneralSettingsQuery } from './fetch-general-settings.query';
import { GeneralSettingsDto } from 'src/thingsboard/interface/rest/dtos/response/general-settings.response.dto';
import { ConfigService } from '@nestjs/config';

@QueryHandler(FetchGeneralSettingsQuery)
export class FetchGeneralSettingsQueryHandler
    implements
    IQueryHandler<
        FetchGeneralSettingsQuery,
        Result<GeneralSettingsDto, ThingsboardApiException>
    > {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
    ) { }

    async execute(
        query: FetchGeneralSettingsQuery,
    ): Promise<Result<GeneralSettingsDto, ThingsboardApiException>> {
        try {
            const settings = await this.thingsboardApi.fetchGeneralSettings(
                query.accessToken,
            );

            return Ok(settings);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
