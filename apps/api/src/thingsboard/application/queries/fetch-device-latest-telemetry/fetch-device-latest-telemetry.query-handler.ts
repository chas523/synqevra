import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Result, Ok, Err } from 'oxide.ts';
import {
  LatestTelemetryResponse,
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { FetchDeviceLatestTelemetryQuery } from './fetch-device-latest-telemetry.query';

@QueryHandler(FetchDeviceLatestTelemetryQuery)
export class FetchDeviceLatestTelemetryQueryHandler implements IQueryHandler<
  FetchDeviceLatestTelemetryQuery,
  Result<LatestTelemetryResponse, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApiPort: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchDeviceLatestTelemetryQuery,
  ): Promise<Result<LatestTelemetryResponse, ThingsboardApiException>> {
    const { accessToken, id, keys } = query;

    try {
      const latestTelemetry = await this.thingsboardApiPort.fetchDeviceLatestTelemetry(
        accessToken,
        id,
        keys,
      );

      return Ok(latestTelemetry);
    } catch (error) {
      return Err(
        ThingsboardApiException.createException(
          'Failed to fetch latest telemetry',
          error,
        ),
      );
    }
  }
}
