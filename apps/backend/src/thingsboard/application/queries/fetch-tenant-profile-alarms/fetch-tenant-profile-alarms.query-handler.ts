import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchTenantProfileAlarmsQuery } from './fetch-tenant-profile-alarms.query';
import { Ok, Result } from 'oxide.ts';
import { Logger, Inject } from '@nestjs/common';
import { EntityAlarmsResponse } from '../../ports/thingsboard.api.port';

import { TBAdminGetError } from '../../../domain/errors/thingsboard-admin.errors';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';

@QueryHandler(FetchTenantProfileAlarmsQuery)
export class FetchTenantProfileAlarmsQueryHandler implements IQueryHandler<
  FetchTenantProfileAlarmsQuery,
  Result<EntityAlarmsResponse, TBAdminGetError>
> {
  private readonly logger = new Logger(
    FetchTenantProfileAlarmsQueryHandler.name,
  );

  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchTenantProfileAlarmsQuery,
  ): Promise<Result<EntityAlarmsResponse, TBAdminGetError>> {
    const {
      tenantProfileId,
      page,
      pageSize,
      statusList,
      severityList,
      startTime,
      endTime,
      accessToken,
    } = query;

    try {
      const response = await this.thingsboardApi.fetchEntityAlarms(
        accessToken!,
        'TENANT_PROFILE',
        tenantProfileId,
        page,
        pageSize,
        statusList,
        severityList,
        startTime,
        endTime,
      );

      return Ok(response);
    } catch (error) {
      this.logger.error('Error fetching tenant profile alarms', error);
      // Return empty list on error (e.g. if not supported or not found)
      return Ok({
        data: [],
        totalPages: 0,
        totalElements: 0,
        hasNext: false,
      });
    }
  }
}
