import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { FetchVersionCreationStatusQuery } from './fetch-version-creation-status.query';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@QueryHandler(FetchVersionCreationStatusQuery)
export class FetchVersionCreationStatusQueryHandler implements IQueryHandler<
  FetchVersionCreationStatusQuery,
  Result<any, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchVersionCreationStatusQuery,
  ): Promise<Result<any, ThingsboardApiException>> {
    const { accessToken, requestId } = query;
    try {
      const response = await this.thingsboardApi.getVersionCreationStatus(
        accessToken,
        requestId,
      );
      return Ok(response);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
