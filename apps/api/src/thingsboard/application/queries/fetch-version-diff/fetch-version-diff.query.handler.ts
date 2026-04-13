import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { FetchVersionDiffQuery } from './fetch-version-diff.query';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@QueryHandler(FetchVersionDiffQuery)
export class FetchVersionDiffQueryHandler implements IQueryHandler<
  FetchVersionDiffQuery,
  Result<any, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchVersionDiffQuery,
  ): Promise<Result<any, ThingsboardApiException>> {
    const { accessToken, entityType, entityId, versionId } = query;
    try {
      const response = await this.thingsboardApi.fetchVersionDiff(
        accessToken,
        entityType,
        entityId,
        versionId,
      );
      return Ok(response);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
