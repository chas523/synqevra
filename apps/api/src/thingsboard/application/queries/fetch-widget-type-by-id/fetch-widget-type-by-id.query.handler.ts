import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { FetchWidgetTypeByIdQuery } from './fetch-widget-type-by-id.query';
import { WidgetTypeDto } from 'src/thingsboard/interface/rest/dtos/response/widget-types.response.dto';
import { ConfigService } from '@nestjs/config';

@QueryHandler(FetchWidgetTypeByIdQuery)
export class FetchWidgetTypeByIdQueryHandler implements IQueryHandler<
  FetchWidgetTypeByIdQuery,
  Result<WidgetTypeDto, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchWidgetTypeByIdQuery,
  ): Promise<Result<WidgetTypeDto, ThingsboardApiException>> {
    try {
      const widgetType = await this.thingsboardApi.fetchWidgetTypeById(
        query.accessToken,
        query.widgetTypeId,
      );

      return Ok(widgetType);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
