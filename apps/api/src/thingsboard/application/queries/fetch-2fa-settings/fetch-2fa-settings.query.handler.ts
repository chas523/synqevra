import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { Result, Ok, Err } from 'oxide.ts';
import { FetchTwoFaSettingsQuery } from './fetch-2fa-settings.query';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from 'src/thingsboard/application/ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { TwoFactorAuthSettingsDto } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-2fa-settings.response.dto';

@QueryHandler(FetchTwoFaSettingsQuery)
export class FetchTwoFaSettingsQueryHandler
    implements IQueryHandler<FetchTwoFaSettingsQuery> {
    private readonly logger = new Logger(FetchTwoFaSettingsQueryHandler.name);

    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApiPort: ThingsboardApiPort,
    ) { }

    async execute(
        query: FetchTwoFaSettingsQuery,
    ): Promise<Result<TwoFactorAuthSettingsDto, ThingsboardApiException>> {
        try {
            const result = await this.thingsboardApiPort.fetchTwoFaSettings(
                query.sysAdminAccessToken,
            );
            return Ok(result);
        } catch (error) {
            return Err(error);
        }
    }
}
