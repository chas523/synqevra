import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { FetchResourceInfoQuery } from './fetch-resource-info.query';
import { ResourceDto } from 'src/thingsboard/interface/rest/dtos/response/resource.response.dto';
import { ConfigService } from '@nestjs/config';

@QueryHandler(FetchResourceInfoQuery)
export class FetchResourceInfoQueryHandler implements IQueryHandler<
  FetchResourceInfoQuery,
  Result<ResourceDto, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchResourceInfoQuery,
  ): Promise<Result<ResourceDto, ThingsboardApiException>> {
    try {
      const resource = await this.thingsboardApi.fetchResourceInfo(
        query.accessToken,
        query.resourceId,
      );

      return Ok(resource);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
