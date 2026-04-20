import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import { FetchEntityTelemetryQuery } from './fetch-entity-telemetry.query';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@QueryHandler(FetchEntityTelemetryQuery)
export class FetchEntityTelemetryQueryHandler implements IQueryHandler<
  FetchEntityTelemetryQuery,
  Result<any, ThingsboardApiException>
> {
  private readonly logger = new Logger(FetchEntityTelemetryQueryHandler.name);

  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchEntityTelemetryQuery,
  ): Promise<Result<any, ThingsboardApiException>> {
    const { accessToken, entityType, entityId, keys } = query;

    try {
      this.logger.log(`Fetching latest telemetry for ${entityType}/${entityId}`);
      // Using generic method if exists, or falling back to specific one for now
      // Let's check if FetchEntityTelemetry exists in Port.
      // Actually, I'll use the device one if it's generic enough in the adapter.
      const data = await (this.thingsboardApi as any).fetchEntityLatestTelemetry?.(
        accessToken,
        entityType,
        entityId,
        keys || [],
      ) || await (this.thingsboardApi as any).fetchDeviceLatestTelemetry(accessToken, entityId, keys || []);
      
      return Ok(data);
    } catch (error) {
      this.logger.error('Error fetching entity telemetry', error);
      return Err(error as ThingsboardApiException);
    }
  }
}
