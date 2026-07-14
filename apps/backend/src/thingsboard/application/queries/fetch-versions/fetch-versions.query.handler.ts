import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { FetchVersionsQuery } from './fetch-versions.query';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@QueryHandler(FetchVersionsQuery)
export class FetchVersionsQueryHandler implements IQueryHandler<
  FetchVersionsQuery,
  Result<any, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchVersionsQuery,
  ): Promise<Result<any, ThingsboardApiException>> {
    const {
      accessToken,
      page,
      pageSize,
      sortProperty,
      sortOrder,
      branch,
      entityType,
      entityId,
    } = query;
    try {
      let response;
      if (entityType && entityId) {
        response = await this.thingsboardApi.fetchEntityVersions(
          accessToken,
          entityType,
          entityId,
          page,
          pageSize,
          sortProperty,
          sortOrder,
          branch,
        );
      } else {
        response = await this.thingsboardApi.fetchVersions(
          accessToken,
          page,
          pageSize,
          sortProperty,
          sortOrder,
          branch,
        );
      }
      return Ok(response);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
