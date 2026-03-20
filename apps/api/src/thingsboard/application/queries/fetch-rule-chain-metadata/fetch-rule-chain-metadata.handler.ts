import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { FetchRuleChainMetadataQuery } from './fetch-rule-chain-metadata.query';
import { ThingsboardApiPort, THINGSBOARD_API_PORT } from '../../ports/thingsboard.api.port';
import { Ok, Err, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@QueryHandler(FetchRuleChainMetadataQuery)
export class FetchRuleChainMetadataHandler
  implements IQueryHandler<FetchRuleChainMetadataQuery, Result<any, ThingsboardApiException>>
{
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchRuleChainMetadataQuery,
  ): Promise<Result<any, ThingsboardApiException>> {
    try {
      const response = await this.thingsboardApi.getRuleChainMetadata(
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
