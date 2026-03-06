import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Ok, Err, Result } from 'oxide.ts';
import { FetchDomainInfosQuery } from './fetch-domain-infos.query';
import { THINGSBOARD_API_PORT, ThingsboardApiPort } from '../../ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@QueryHandler(FetchDomainInfosQuery)
export class FetchDomainInfosQueryHandler implements IQueryHandler<FetchDomainInfosQuery, Result<any, ThingsboardApiException>> {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
    ) { }

    async execute(query: FetchDomainInfosQuery): Promise<Result<any, ThingsboardApiException>> {
        try {
            const data = await this.thingsboardApi.getDomainInfos(query.accessToken, query.params);
            return Ok(data);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
