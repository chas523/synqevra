import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { Result, Ok, Err } from 'oxide.ts';
import { ThingsboardApiPort, THINGSBOARD_API_PORT } from '../../ports/thingsboard.api.port';
import { FetchRuleChainsQuery } from './fetch-rule-chains.query';
import { ThingsboardApiException } from '../../../infrastructure/http/thingsboard.http.errors';

@QueryHandler(FetchRuleChainsQuery)
export class FetchRuleChainsQueryHandler implements IQueryHandler<FetchRuleChainsQuery> {
  private readonly logger = new Logger(FetchRuleChainsQueryHandler.name);

  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(query: FetchRuleChainsQuery): Promise<Result<any, ThingsboardApiException>> {
    try {
      const response = await this.thingsboardApi.fetchRuleChains(
        query.accessToken,
        query.page,
        query.pageSize,
        query.sortProperty,
        query.sortOrder,
        query.type,
      );
      return Ok(response);
    } catch (error) {
      if (error instanceof ThingsboardApiException) {
        return Err(error);
      }
      return Err(new ThingsboardApiException(String(error), 500));
    }
  }
}
