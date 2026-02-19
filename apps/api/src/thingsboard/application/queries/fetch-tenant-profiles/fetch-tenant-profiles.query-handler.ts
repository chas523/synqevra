import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchTenantProfilesQuery } from './fetch-tenant-profiles.query';
import { Err, Ok, Result } from 'oxide.ts';
import { TBAdminGetError } from '../../../domain/errors/thingsboard-admin.errors';
import { TenantProfilesResponse } from '../../ports/thingsboard.api.port';
import { Inject, Logger } from '@nestjs/common';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ConfigService } from '@nestjs/config';

@QueryHandler(FetchTenantProfilesQuery)
export class FetchTenantProfilesQueryHandler implements IQueryHandler<
    FetchTenantProfilesQuery,
    Result<TenantProfilesResponse, TBAdminGetError>
> {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
    ) { }

    private readonly logger = new Logger(FetchTenantProfilesQueryHandler.name);

    async execute(
        query: FetchTenantProfilesQuery,
    ): Promise<Result<TenantProfilesResponse, TBAdminGetError>> {
        const { page, pageSize, sortProperty, sortOrder, textSearch, accessToken } = query;

        try {

            const response = await this.thingsboardApi.fetchTenantProfiles(
                accessToken!,
                page,
                pageSize,
                sortProperty,
                sortOrder,
                textSearch,
            );

            return Ok(response);
        } catch (error) {
            this.logger.error('Error fetching tenant profiles', error);

            return Err(new TBAdminGetError());
        }
    }
}
