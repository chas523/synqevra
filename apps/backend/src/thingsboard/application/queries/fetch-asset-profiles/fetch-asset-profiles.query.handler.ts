import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import {
  AssetProfilesResponse,
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { FetchAssetProfilesQuery } from './fetch-asset-profiles.query';

@QueryHandler(FetchAssetProfilesQuery)
export class FetchAssetProfilesQueryHandler implements IQueryHandler<
  FetchAssetProfilesQuery,
  Result<AssetProfilesResponse, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchAssetProfilesQuery,
  ): Promise<Result<AssetProfilesResponse, ThingsboardApiException>> {
    try {
      const response = await this.thingsboardApi.fetchAssetProfiles(
        query.accessToken,
        query.page,
        query.pageSize,
        query.sortProperty,
        query.sortOrder,
        query.textSearch,
      );

      return Ok(response);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
