import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { FetchAutoCommitSettingsQuery } from './fetch-auto-commit-settings.query';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@QueryHandler(FetchAutoCommitSettingsQuery)
export class FetchAutoCommitSettingsQueryHandler implements IQueryHandler<
  FetchAutoCommitSettingsQuery,
  Result<any, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchAutoCommitSettingsQuery,
  ): Promise<Result<any, ThingsboardApiException>> {
    const { accessToken } = query;
    try {
      const response =
        await this.thingsboardApi.getAutoCommitSettings(accessToken);
      return Ok(response);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
