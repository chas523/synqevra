import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import { FetchEntityRelationsQuery } from './fetch-entity-relations.query';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@QueryHandler(FetchEntityRelationsQuery)
export class FetchEntityRelationsQueryHandler implements IQueryHandler<
  FetchEntityRelationsQuery,
  Result<any, ThingsboardApiException>
> {
  private readonly logger = new Logger(FetchEntityRelationsQueryHandler.name);

  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchEntityRelationsQuery,
  ): Promise<Result<any, ThingsboardApiException>> {
    const { accessToken, entityType, entityId, direction } = query;

    try {
      this.logger.log(
        `Fetching relations for ${entityType}/${entityId} [${direction}]`,
      );
      const data = await this.thingsboardApi.fetchEntityRelations(
        accessToken,
        entityType,
        entityId,
        direction,
      );
      return Ok(data);
    } catch (error) {
      this.logger.error('Error fetching entity relations', error);
      return Err(error as ThingsboardApiException);
    }
  }
}
