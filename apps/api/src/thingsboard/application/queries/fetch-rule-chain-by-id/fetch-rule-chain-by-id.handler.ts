import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { FetchRuleChainByIdQuery } from './fetch-rule-chain-by-id.query';
import {
  ThingsboardApiPort,
  THINGSBOARD_API_PORT,
} from '../../ports/thingsboard.api.port';
import { Ok, Err, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@QueryHandler(FetchRuleChainByIdQuery)
export class FetchRuleChainByIdHandler implements IQueryHandler<
  FetchRuleChainByIdQuery,
  Result<any, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchRuleChainByIdQuery,
  ): Promise<Result<any, ThingsboardApiException>> {
    try {
      const response = await this.thingsboardApi.getRuleChain(
        query.id,
        query.accessToken,
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
