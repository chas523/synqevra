import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchTenantEventsQuery } from './fetch-tenant-events.query';
import { Err, Ok, Result } from 'oxide.ts';
import { Logger, Inject } from '@nestjs/common';
import { EntityEventsResponse } from '../../ports/thingsboard.api.port';

import { TBAdminGetError } from '../../../domain/errors/thingsboard-admin.errors';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';

@QueryHandler(FetchTenantEventsQuery)
export class FetchTenantEventsQueryHandler implements IQueryHandler<
  FetchTenantEventsQuery,
  Result<EntityEventsResponse, TBAdminGetError>
> {
  private readonly logger = new Logger(FetchTenantEventsQueryHandler.name);

  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchTenantEventsQuery,
  ): Promise<Result<EntityEventsResponse, TBAdminGetError>> {
    const {
      tenantId,
      page,
      pageSize,
      eventType,
      startTime,
      endTime,
      accessToken,
    } = query;

    try {
      const response = await this.thingsboardApi.fetchEntityEvents(
        accessToken!,
        'TENANT',
        tenantId,
        page,
        pageSize,
        eventType,
        startTime,
        endTime,
      );

      return Ok(response);
    } catch (error) {
      this.logger.error('Error fetching tenant events', error);
      return Err(new TBAdminGetError());
    }
  }
}
