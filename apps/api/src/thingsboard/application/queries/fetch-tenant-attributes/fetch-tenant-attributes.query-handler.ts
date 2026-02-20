import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchTenantAttributesQuery } from './fetch-tenant-attributes.query';
import { Err, Ok, Result } from 'oxide.ts';
import { Logger } from '@nestjs/common';
import { TenantAttributesResponse } from '../../ports/thingsboard.api.port';

import { TBAdminGetError } from '../../../domain/errors/thingsboard-admin.errors';
import { Inject } from '@nestjs/common';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';

@QueryHandler(FetchTenantAttributesQuery)
export class FetchTenantAttributesQueryHandler
    implements
    IQueryHandler<
        FetchTenantAttributesQuery,
        Result<TenantAttributesResponse, TBAdminGetError>
    > {
    private readonly logger = new Logger(FetchTenantAttributesQueryHandler.name);

    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
    ) { }

    async execute(
        query: FetchTenantAttributesQuery,
    ): Promise<Result<TenantAttributesResponse, TBAdminGetError>> {
        const { tenantId, scope, accessToken } = query;

        try {

            const response = await this.thingsboardApi.fetchTenantAttributes(
                accessToken!,
                tenantId,
                scope,
            );

            return Ok(response);
        } catch (error) {
            this.logger.error('Error fetching tenant attributes', error);
            return Err(new TBAdminGetError());
        }
    }
}
