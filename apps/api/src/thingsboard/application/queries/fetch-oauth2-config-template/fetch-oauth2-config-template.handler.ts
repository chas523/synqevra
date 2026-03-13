import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Ok, Err, Result } from 'oxide.ts';
import { FetchOAuth2ConfigTemplateQuery } from './fetch-oauth2-config-template.query';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@QueryHandler(FetchOAuth2ConfigTemplateQuery)
export class FetchOAuth2ConfigTemplateQueryHandler implements IQueryHandler<
  FetchOAuth2ConfigTemplateQuery,
  Result<any, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchOAuth2ConfigTemplateQuery,
  ): Promise<Result<any, ThingsboardApiException>> {
    try {
      const data = await this.thingsboardApi.getOAuth2ConfigTemplate(
        query.accessToken,
      );
      return Ok(data);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
