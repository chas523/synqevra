import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { FetchResourcesQuery } from './fetch-resources.query';
import { ResourcesPageResponseDto } from 'src/thingsboard/interface/rest/dtos/response/resource.response.dto';
import { ConfigService } from '@nestjs/config';

@QueryHandler(FetchResourcesQuery)
export class FetchResourcesQueryHandler
    implements
    IQueryHandler<
        FetchResourcesQuery,
        Result<ResourcesPageResponseDto, ThingsboardApiException>
    > {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
    ) { }

    async execute(
        query: FetchResourcesQuery,
    ): Promise<Result<ResourcesPageResponseDto, ThingsboardApiException>> {
        try {
            const resources = await this.thingsboardApi.fetchResources(
                query.accessToken,
                query.page,
                query.pageSize,
                query.sortProperty,
                query.sortOrder,
                query.resourceType,
                query.resourceSubType,
            );

            return Ok(resources);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
