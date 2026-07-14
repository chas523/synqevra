import { Inject, Logger } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { FetchMaterialIconsQuery } from './fetch-material-icons.query';

@QueryHandler(FetchMaterialIconsQuery)
export class FetchMaterialIconsQueryHandler implements IQueryHandler<
  FetchMaterialIconsQuery,
  Result<string[], ThingsboardApiException>
> {
  private readonly logger = new Logger(FetchMaterialIconsQueryHandler.name);

  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchMaterialIconsQuery,
  ): Promise<Result<string[], ThingsboardApiException>> {
    try {
      const icons = await this.thingsboardApi.fetchMaterialIcons(
        query.accessToken,
      );

      return Ok(icons);
    } catch (error) {
      this.logger.error('Error fetching material icons', error);
      return Err(error as ThingsboardApiException);
    }
  }
}
