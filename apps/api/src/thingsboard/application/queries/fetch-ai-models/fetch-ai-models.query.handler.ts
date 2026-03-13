import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { FetchAiModelsQuery } from './fetch-ai-models.query';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@QueryHandler(FetchAiModelsQuery)
export class FetchAiModelsQueryHandler implements IQueryHandler<
  FetchAiModelsQuery,
  Result<any, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchAiModelsQuery,
  ): Promise<Result<any, ThingsboardApiException>> {
    const { accessToken, page, pageSize, sortProperty, sortOrder } = query;
    try {
      const response = await this.thingsboardApi.getAiModels(
        accessToken,
        page,
        pageSize,
        sortProperty,
        sortOrder,
      );
      return Ok(response);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
