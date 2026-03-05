import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Result, Ok, Err } from 'oxide.ts';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { FetchDeviceTelemetryKeysQuery } from './fetch-device-telemetry-keys.query';

@QueryHandler(FetchDeviceTelemetryKeysQuery)
export class FetchDeviceTelemetryKeysQueryHandler implements IQueryHandler<
  FetchDeviceTelemetryKeysQuery,
  Result<string[], ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApiPort: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchDeviceTelemetryKeysQuery,
  ): Promise<Result<string[], ThingsboardApiException>> {
    const { accessToken, id } = query;

    try {
      const keys = await this.thingsboardApiPort.fetchDeviceTelemetryKeys(
        accessToken,
        id,
      );

      return Ok(keys);
    } catch (error) {
      return Err(
        ThingsboardApiException.createException(
          'Failed to fetch telemetry keys',
          error,
        ),
      );
    }
  }
}
