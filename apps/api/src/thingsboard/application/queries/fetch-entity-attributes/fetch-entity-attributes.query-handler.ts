import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import { FetchEntityAttributesQuery } from './fetch-entity-attributes.query';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@QueryHandler(FetchEntityAttributesQuery)
export class FetchEntityAttributesQueryHandler implements IQueryHandler<
  FetchEntityAttributesQuery,
  Result<any, ThingsboardApiException>
> {
  private readonly logger = new Logger(FetchEntityAttributesQueryHandler.name);

  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchEntityAttributesQuery,
  ): Promise<Result<any, ThingsboardApiException>> {
    const { accessToken, entityType, entityId, scope, keys } = query;

    try {
      this.logger.log(`Fetching attributes for ${entityType}/${entityId} [${scope}]`);
      const data = await this.thingsboardApi.fetchEntityAttributes(
        accessToken,
        entityType,
        entityId,
        scope,
        keys,
      );
      return Ok(data);
    } catch (error) {
      this.logger.error('Error fetching entity attributes', error);
      return Err(error as ThingsboardApiException);
    }
  }
}
