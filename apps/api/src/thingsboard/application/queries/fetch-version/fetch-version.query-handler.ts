import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchVersionQuery } from './fetch-version.query';
import { DashboardVersionResponse } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-version.response.dto';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { Err, Ok, Result } from 'oxide.ts';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { Inject } from '@nestjs/common';

@QueryHandler(FetchVersionQuery)
export class FetchVersionQueryHandler implements IQueryHandler<
  FetchVersionQuery,
  Result<DashboardVersionResponse, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    public readonly thingsboardApiRepository: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchVersionQuery,
  ): Promise<Result<DashboardVersionResponse, ThingsboardApiException>> {
    try {
      const version = await this.thingsboardApiRepository.fetchDashboardVersion(
        query.accessToken,
      );
      return Ok(version);
    } catch (e) {
      return Err(e as ThingsboardApiException);
    }
  }
}
