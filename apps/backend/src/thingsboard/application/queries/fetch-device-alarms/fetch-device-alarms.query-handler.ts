import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchDeviceAlarmsQuery } from './fetch-device-alarms.query';
import { Inject } from '@nestjs/common';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
  EntityAlarmsResponse,
} from '../../ports/thingsboard.api.port';
import { Ok, Err, Result } from 'oxide.ts';
import { TBAdminGetError } from '../../../domain/errors/thingsboard-admin.errors';

@QueryHandler(FetchDeviceAlarmsQuery)
export class FetchDeviceAlarmsQueryHandler implements IQueryHandler<
  FetchDeviceAlarmsQuery,
  Result<EntityAlarmsResponse, TBAdminGetError>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchDeviceAlarmsQuery,
  ): Promise<Result<EntityAlarmsResponse, TBAdminGetError>> {
    try {
      const response = await this.thingsboardApi.fetchEntityAlarms(
        query.accessToken,
        'DEVICE',
        query.deviceId,
        query.page,
        query.pageSize,
        query.statusList,
        query.severityList,
        query.startTime,
        query.endTime,
      );

      return Ok(response);
    } catch (error) {
      return Err(new TBAdminGetError());
    }
  }
}
