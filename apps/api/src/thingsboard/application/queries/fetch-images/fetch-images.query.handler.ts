import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { FetchImagesQuery } from './fetch-images.query';
import { ImagesPageResponseDto } from 'src/thingsboard/interface/rest/dtos/response/image.response.dto';

@QueryHandler(FetchImagesQuery)
export class FetchImagesQueryHandler implements IQueryHandler<
  FetchImagesQuery,
  Result<ImagesPageResponseDto, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchImagesQuery,
  ): Promise<Result<ImagesPageResponseDto, ThingsboardApiException>> {
    try {
      const response = await this.thingsboardApi.fetchImages(
        query.accessToken,
        query.page,
        query.pageSize,
        query.sortProperty,
        query.sortOrder,
        query.imageSubType,
        query.includeSystemImages,
      );

      return Ok(response);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
