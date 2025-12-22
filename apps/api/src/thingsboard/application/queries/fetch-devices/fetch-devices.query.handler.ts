import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchDevicesQuery } from './fetch-devices.query';
import { Inject } from '@nestjs/common';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { DevicesResponse } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-devices.response.dto';
import { Result, Ok, Err } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@QueryHandler(FetchDevicesQuery)
export class FetchDevicesQueryHandler
  implements
    IQueryHandler<
      FetchDevicesQuery,
      Result<DevicesResponse, ThingsboardApiException>
    >
{
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchDevicesQuery,
  ): Promise<Result<DevicesResponse, ThingsboardApiException>> {
    const { accessToken, page, pageSize } = query;
    try {
      const devicesResponse: DevicesResponse =
        await this.thingsboardApi.fetchDevices(accessToken, page, pageSize);

      return Ok(devicesResponse);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
