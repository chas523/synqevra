import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { FetchTrendzSettingsQuery } from './fetch-trendz-settings.query';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@QueryHandler(FetchTrendzSettingsQuery)
export class FetchTrendzSettingsQueryHandler implements IQueryHandler<
  FetchTrendzSettingsQuery,
  Result<any, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchTrendzSettingsQuery,
  ): Promise<Result<any, ThingsboardApiException>> {
    const { accessToken } = query;
    try {
      const response = await this.thingsboardApi.getTrendzSettings(accessToken);
      return Ok(response);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
