import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import { FetchEntityTelemetryKeysQuery } from './fetch-entity-telemetry-keys.query';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@QueryHandler(FetchEntityTelemetryKeysQuery)
export class FetchEntityTelemetryKeysQueryHandler implements IQueryHandler<
  FetchEntityTelemetryKeysQuery,
  Result<string[], ThingsboardApiException>
> {
  private readonly logger = new Logger(FetchEntityTelemetryKeysQueryHandler.name);

  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchEntityTelemetryKeysQuery,
  ): Promise<Result<string[], ThingsboardApiException>> {
    const { accessToken, entityType, entityId } = query;

    try {
      this.logger.log(`Fetching telemetry keys for ${entityType}/${entityId}`);
      // Fallback to fetchDeviceTelemetryKeys if generic is not in Port
      const data = await (this.thingsboardApi as any).fetchEntityTelemetryKeys?.(
        accessToken,
        entityType,
        entityId,
      ) || await (this.thingsboardApi as any).fetchDeviceTelemetryKeys(accessToken, entityId);
      
      return Ok(data);
    } catch (error) {
      this.logger.error('Error fetching entity telemetry keys', error);
      return Err(error as ThingsboardApiException);
    }
  }
}
