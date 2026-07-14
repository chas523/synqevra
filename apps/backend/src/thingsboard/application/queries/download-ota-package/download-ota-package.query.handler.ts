import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { DownloadOtaPackageQuery } from './download-ota-package.query';
import { Inject } from '@nestjs/common';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@QueryHandler(DownloadOtaPackageQuery)
export class DownloadOtaPackageQueryHandler implements IQueryHandler<
  DownloadOtaPackageQuery,
  Result<Buffer, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: DownloadOtaPackageQuery,
  ): Promise<Result<Buffer, ThingsboardApiException>> {
    const { accessToken, id } = query;
    try {
      const buffer = await this.thingsboardApi.downloadOtaPackage(
        accessToken,
        id,
      );
      return Ok(buffer);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
