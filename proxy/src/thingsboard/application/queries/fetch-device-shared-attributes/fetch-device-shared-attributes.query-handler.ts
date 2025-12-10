import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DeviceAttributes } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-device-attributes.response.dto';
import { Inject } from '@nestjs/common';
import { Result, Ok, Err } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { FetchDeviceSharedAttributesQuery } from './fetch-device-shared-attributes.query';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';

@QueryHandler(FetchDeviceSharedAttributesQuery)
export class FetchDeviceSharedAttributesQueryHandler
  implements
    IQueryHandler<
      FetchDeviceSharedAttributesQuery,
      Result<DeviceAttributes, ThingsboardApiException>
    >
{
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApiPort: ThingsboardApiPort,
  ) {}
  async execute(
    query: FetchDeviceSharedAttributesQuery,
  ): Promise<Result<DeviceAttributes, ThingsboardApiException>> {
    const { accessToken, id } = query;

    try {
      const deviceAttributes: DeviceAttributes =
        await this.thingsboardApiPort.fetchDeviceSharedAttributes(
          accessToken,
          id,
        );

      return Ok(deviceAttributes);
    } catch (error) {
      return Err(
        ThingsboardApiException.createException(
          'Failed to fetch device shared attributes',
          error,
        ),
      );
    }
  }
}
