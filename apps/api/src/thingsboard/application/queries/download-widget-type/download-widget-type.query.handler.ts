import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { DownloadWidgetTypeQuery } from './download-widget-type.query';
import { ConfigService } from '@nestjs/config';

@QueryHandler(DownloadWidgetTypeQuery)
export class DownloadWidgetTypeQueryHandler implements IQueryHandler<
  DownloadWidgetTypeQuery,
  Result<any, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: DownloadWidgetTypeQuery,
  ): Promise<Result<any, ThingsboardApiException>> {
    try {
      const widgetType = await this.thingsboardApi.downloadWidgetType(
        query.accessToken,
        query.widgetTypeId,
        query.includeResources,
      );

      return Ok(widgetType);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
