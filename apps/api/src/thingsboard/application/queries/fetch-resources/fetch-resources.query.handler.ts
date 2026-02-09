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
        query: FetchResourcesQuery,
    ): Promise<Result<ResourcesPageResponseDto, ThingsboardApiException>> {
        try {
            const loginResponse = await this.thingsboardApi.loginToSysadminAccount(
                this.THINGSBOARD_SYSADMIN_EMAIL,
                this.THINGSBOARD_SYSADMIN_PASSWORD,
            );

            const resources = await this.thingsboardApi.fetchResources(
                loginResponse.token,
                query.page,
                query.pageSize,
                query.sortProperty,
                query.sortOrder,
                query.resourceType,
            );

            return Ok(resources);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
