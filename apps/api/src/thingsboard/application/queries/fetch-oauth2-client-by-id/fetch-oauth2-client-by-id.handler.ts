import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { FetchOAuth2ClientByIdQuery } from './fetch-oauth2-client-by-id.query';

@QueryHandler(FetchOAuth2ClientByIdQuery)
export class FetchOAuth2ClientByIdHandler implements IQueryHandler<FetchOAuth2ClientByIdQuery> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchOAuth2ClientByIdQuery,
  ): Promise<Result<any, ThingsboardApiException>> {
    try {
      const response = await this.thingsboardApi.getOAuth2ClientById(
        query.accessToken,
        query.clientId,
      );
      return Ok(response);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
