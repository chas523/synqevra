import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { FetchRepoSettingsQuery } from './fetch-repo-settings.query';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@QueryHandler(FetchRepoSettingsQuery)
export class FetchRepoSettingsQueryHandler implements IQueryHandler<
  FetchRepoSettingsQuery,
  Result<any, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchRepoSettingsQuery,
  ): Promise<Result<any, ThingsboardApiException>> {
    const { accessToken } = query;
    try {
      const response = await this.thingsboardApi.getRepoSettings(accessToken);
      return Ok(response);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
