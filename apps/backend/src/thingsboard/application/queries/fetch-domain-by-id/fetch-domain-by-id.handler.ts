import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Ok, Err, Result } from 'oxide.ts';
import { FetchDomainByIdQuery } from './fetch-domain-by-id.query';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@QueryHandler(FetchDomainByIdQuery)
export class FetchDomainByIdQueryHandler implements IQueryHandler<
  FetchDomainByIdQuery,
  Result<any, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchDomainByIdQuery,
  ): Promise<Result<any, ThingsboardApiException>> {
    try {
      const data = await this.thingsboardApi.getDomainById(
        query.accessToken,
        query.domainId,
      );
      return Ok(data);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
