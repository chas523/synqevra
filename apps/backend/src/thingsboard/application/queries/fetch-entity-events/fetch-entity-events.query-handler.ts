import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchEntityEventsQuery } from './fetch-entity-events.query';
import { Inject, Logger } from '@nestjs/common';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
  EntityEventsResponse,
} from '../../ports/thingsboard.api.port';
import { Result, Ok, Err } from 'oxide.ts';
import { ThingsboardApiException } from '../../../infrastructure/http/thingsboard.http.errors';

@QueryHandler(FetchEntityEventsQuery)
export class FetchEntityEventsQueryHandler implements IQueryHandler<
  FetchEntityEventsQuery,
  Result<EntityEventsResponse, ThingsboardApiException>
> {
  private readonly logger = new Logger(FetchEntityEventsQueryHandler.name);

  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchEntityEventsQuery,
  ): Promise<Result<EntityEventsResponse, ThingsboardApiException>> {
    try {
      const response = await this.thingsboardApi.fetchEntityEventsByQuery(
        query.accessToken,
        query.entityType,
        query.entityId,
        query.tenantId,
        query.eventType,
        query.page,
        query.pageSize,
        query.sortProperty,
        query.sortOrder,
        query.startTime,
        query.endTime,
      );
      return Ok(response);
    } catch (error) {
      this.logger.error(
        `Error fetching entity events for ${query.entityType} ${query.entityId}:`,
        error,
      );
      return Err(
        new ThingsboardApiException(
          `Failed to fetch entity events: ${(error as Error).message}`,
        ),
      );
    }
  }
}
