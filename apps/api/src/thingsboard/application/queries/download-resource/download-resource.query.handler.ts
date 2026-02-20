import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { DownloadResourceQuery } from './download-resource.query';
import { ConfigService } from '@nestjs/config';

@QueryHandler(DownloadResourceQuery)
export class DownloadResourceQueryHandler
    implements
    IQueryHandler<
        DownloadResourceQuery,
        Result<Buffer, ThingsboardApiException>
    > {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
    ) { }

    async execute(
        query: DownloadResourceQuery,
    ): Promise<Result<Buffer, ThingsboardApiException>> {
        try {
            const buffer = await this.thingsboardApi.downloadResource(
                query.accessToken,
                query.resourceId,
            );

            return Ok(buffer);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
