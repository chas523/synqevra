import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchWidgetsBundlesQuery } from './fetch-widgets-bundles.query';
import { Inject } from '@nestjs/common';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { Result, Ok, Err } from 'oxide.ts';
import { ThingsboardApiException } from '../../../infrastructure/http/thingsboard.http.errors';
import { Logger } from '@nestjs/common';

@QueryHandler(FetchWidgetsBundlesQuery)
export class FetchWidgetsBundlesHandler implements IQueryHandler<FetchWidgetsBundlesQuery> {
  private readonly logger = new Logger(FetchWidgetsBundlesHandler.name);

  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchWidgetsBundlesQuery,
  ): Promise<Result<any, ThingsboardApiException>> {
    const {
      accessToken,
      page,
      pageSize,
      sortProperty,
      sortOrder,
      tenantOnly,
      fullSearch,
      scadaFirst,
      deprecatedFilter,
    } = query;

    try {
      const result = await this.thingsboardApi.getWidgetsBundles(
        accessToken,
        page,
        pageSize,
        sortProperty,
        sortOrder,
        tenantOnly,
        fullSearch,
        scadaFirst,
        deprecatedFilter,
      );
      return Ok(result);
    } catch (error) {
      this.logger.error(`Failed to fetch widget bundles: ${error}`);
      return Err(error as ThingsboardApiException);
    }
  }
}
