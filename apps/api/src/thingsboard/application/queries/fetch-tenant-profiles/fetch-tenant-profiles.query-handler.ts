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
        private readonly configService: ConfigService,
    ) { }

    private readonly logger = new Logger(FetchTenantProfilesQueryHandler.name);

    private get THINGSBOARD_SYSADMIN_EMAIL(): string {
        return this.configService.getOrThrow<string>('THINGSBOARD_SYSADMIN_EMAIL');
    }

    private get THINGSBOARD_SYSADMIN_PASSWORD(): string {
        return this.configService.getOrThrow<string>(
            'THINGSBOARD_SYSADMIN_PASSWORD',
        );
    }

    async execute(
        query: FetchTenantProfilesQuery,
    ): Promise<Result<TenantProfilesResponse, TBAdminGetError>> {
        const { page, pageSize, sortProperty, sortOrder, textSearch } = query;

        try {
            const loginResponse = await this.thingsboardApi.loginToSysadminAccount(
                this.THINGSBOARD_SYSADMIN_EMAIL,
                this.THINGSBOARD_SYSADMIN_PASSWORD,
            );

            const sysAdminAccessToken = loginResponse.token;

            const response = await this.thingsboardApi.fetchTenantProfiles(
                sysAdminAccessToken,
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
