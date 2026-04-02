import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import {
  DeviceProfilesResponse,
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { FetchDeviceProfilesQuery } from './fetch-device-profiles.query';

@QueryHandler(FetchDeviceProfilesQuery)
export class FetchDeviceProfilesQueryHandler implements IQueryHandler<
  FetchDeviceProfilesQuery,
  Result<DeviceProfilesResponse, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchDeviceProfilesQuery,
  ): Promise<Result<DeviceProfilesResponse, ThingsboardApiException>> {
    try {
      const response = await this.thingsboardApi.fetchDeviceProfiles(
        query.accessToken,
        query.page,
        query.pageSize,
        query.sortProperty,
        query.sortOrder,
        query.textSearch,
      );

      return Ok(response);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
