import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Result, Ok, Err } from 'oxide.ts';
import {
  DeviceCalculatedFieldsResponse,
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { FetchDeviceCalculatedFieldsQuery } from './fetch-device-calculated-fields.query';

@QueryHandler(FetchDeviceCalculatedFieldsQuery)
export class FetchDeviceCalculatedFieldsQueryHandler implements IQueryHandler<
  FetchDeviceCalculatedFieldsQuery,
  Result<DeviceCalculatedFieldsResponse, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApiPort: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchDeviceCalculatedFieldsQuery,
  ): Promise<Result<DeviceCalculatedFieldsResponse, ThingsboardApiException>> {
    const { accessToken, id, page, pageSize, sortProperty, sortOrder } = query;

    try {
      const response =
        await this.thingsboardApiPort.fetchDeviceCalculatedFields(
          accessToken,
          id,
          page,
          pageSize,
          sortProperty,
          sortOrder,
        );

      return Ok(response);
    } catch (error) {
      return Err(
        ThingsboardApiException.createException(
          'Failed to fetch device calculated fields',
          error,
        ),
      );
    }
  }
}
