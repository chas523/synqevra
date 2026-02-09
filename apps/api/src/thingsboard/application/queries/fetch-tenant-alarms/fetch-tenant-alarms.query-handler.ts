import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchTenantAlarmsQuery } from './fetch-tenant-alarms.query';
import { Err, Ok, Result } from 'oxide.ts';
import { Logger, Inject } from '@nestjs/common';
import { EntityAlarmsResponse } from '../../ports/thingsboard.api.port';
import { SysAdminAuthService } from '../../services/sysadmin-auth.service';
import { TBAdminGetError } from '../../../domain/errors/thingsboard-admin.errors';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';

@QueryHandler(FetchTenantAlarmsQuery)
export class FetchTenantAlarmsQueryHandler
    implements
    IQueryHandler<
        FetchTenantAlarmsQuery,
        Result<EntityAlarmsResponse, TBAdminGetError>
    > {
    private readonly logger = new Logger(FetchTenantAlarmsQueryHandler.name);

    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
        private readonly sysAdminAuth: SysAdminAuthService,
    ) { }

    async execute(
        query: FetchTenantAlarmsQuery,
    ): Promise<Result<EntityAlarmsResponse, TBAdminGetError>> {
        const { tenantId, page, pageSize, statusList, severityList, startTime, endTime } = query;

        try {
            const accessToken = await this.sysAdminAuth.getAccessToken();

            const response = await this.thingsboardApi.fetchEntityAlarms(
                accessToken,
                'TENANT',
                tenantId,
                page,
                pageSize,
                statusList,
                severityList,
                startTime,
                endTime,
            );

            return Ok(response);
        } catch (error) {
            this.logger.error('Error fetching tenant alarms', error);
            return Err(new TBAdminGetError());
        }
    }
}
