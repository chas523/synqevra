import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchDeviceByIdQuery } from './fetch-device-by-id.query';
import { Inject } from '@nestjs/common';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { DeviceDetails } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-device.response.dto';

@QueryHandler(FetchDeviceByIdQuery)
export class FetchDeviceByIdQueryHandler implements IQueryHandler<
  FetchDeviceByIdQuery,
  Result<DeviceDetails, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchDeviceByIdQuery,
  ): Promise<Result<DeviceDetails, ThingsboardApiException>> {
    const { accessToken, id } = query;
    try {
      const deviceDetailsResponse: DeviceDetails =
        await this.thingsboardApi.fetchDevice(accessToken, id);

      return Ok(deviceDetailsResponse);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
