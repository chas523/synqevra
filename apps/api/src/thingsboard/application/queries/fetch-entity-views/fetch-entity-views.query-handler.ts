import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import {
  EntityViewsResponse,
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { FetchEntityViewsQuery } from './fetch-entity-views.query';

@QueryHandler(FetchEntityViewsQuery)
export class FetchEntityViewsQueryHandler implements IQueryHandler<
  FetchEntityViewsQuery,
  Result<EntityViewsResponse, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchEntityViewsQuery,
  ): Promise<Result<EntityViewsResponse, ThingsboardApiException>> {
    try {
      const response = await this.thingsboardApi.fetchEntityViews(
        query.accessToken,
        query.page,
        query.pageSize,
        query.sortProperty,
        query.sortOrder,
        query.type,
      );

      return Ok(response);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
