import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Ok, Err, Result } from 'oxide.ts';
import { FetchDeviceAuditLogsQuery } from './fetch-device-audit-logs.query';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
  EntityAuditLogsResponse,
} from '../../ports/thingsboard.api.port';
import { TBAdminGetError } from '../../../domain/errors/thingsboard-admin.errors';

@QueryHandler(FetchDeviceAuditLogsQuery)
export class FetchDeviceAuditLogsQueryHandler implements IQueryHandler<
  FetchDeviceAuditLogsQuery,
  Result<EntityAuditLogsResponse, TBAdminGetError>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchDeviceAuditLogsQuery,
  ): Promise<Result<EntityAuditLogsResponse, TBAdminGetError>> {
    try {
      const response = await this.thingsboardApi.fetchEntityAuditLogs(
        query.accessToken,
        'DEVICE',
        query.deviceId,
        query.page,
        query.pageSize,
        query.sortProperty,
        query.sortOrder,
        query.startTime,
        query.endTime,
      );

      return Ok(response);
    } catch (error) {
      return Err(new TBAdminGetError());
    }
  }
}
