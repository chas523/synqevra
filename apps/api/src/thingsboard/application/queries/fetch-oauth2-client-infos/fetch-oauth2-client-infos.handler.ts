import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Ok, Err, Result } from 'oxide.ts';
import { FetchOAuth2ClientInfosQuery } from './fetch-oauth2-client-infos.query';
import { THINGSBOARD_API_PORT, ThingsboardApiPort } from '../../ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@QueryHandler(FetchOAuth2ClientInfosQuery)
export class FetchOAuth2ClientInfosQueryHandler implements IQueryHandler<FetchOAuth2ClientInfosQuery, Result<any, ThingsboardApiException>> {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
    ) { }

    async execute(query: FetchOAuth2ClientInfosQuery): Promise<Result<any, ThingsboardApiException>> {
        try {
            const data = await this.thingsboardApi.getOAuth2ClientInfos(query.accessToken, query.params);
            return Ok(data);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
