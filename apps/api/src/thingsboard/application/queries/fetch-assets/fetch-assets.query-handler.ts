import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import {
  AssetsResponse,
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { FetchAssetsQuery } from './fetch-assets.query';

@QueryHandler(FetchAssetsQuery)
export class FetchAssetsQueryHandler
  implements IQueryHandler<FetchAssetsQuery, Result<AssetsResponse, ThingsboardApiException>>
{
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchAssetsQuery,
  ): Promise<Result<AssetsResponse, ThingsboardApiException>> {
    try {
      const response = await this.thingsboardApi.fetchAssets(
        query.accessToken,
        query.page,
        query.pageSize,
        query.sortProperty,
        query.sortOrder,
        query.assetProfileId,
      );

      return Ok(response);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
