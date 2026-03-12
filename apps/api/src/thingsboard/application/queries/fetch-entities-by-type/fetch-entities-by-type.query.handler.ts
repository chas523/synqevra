import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { FetchEntitiesByTypeQuery } from './fetch-entities-by-type.query';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@QueryHandler(FetchEntitiesByTypeQuery)
export class FetchEntitiesByTypeQueryHandler implements IQueryHandler<
  FetchEntitiesByTypeQuery,
  Result<any, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchEntitiesByTypeQuery,
  ): Promise<Result<any, ThingsboardApiException>> {
    const { accessToken, entityType, page, pageSize } = query;
    try {
      const response = await this.thingsboardApi.getEntitiesByType(
        accessToken,
        entityType,
        page,
        pageSize,
      );
      return Ok(response);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
