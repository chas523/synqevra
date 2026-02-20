import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { DownloadImageQuery } from './download-image.query';


@QueryHandler(DownloadImageQuery)
export class DownloadImageQueryHandler
    implements IQueryHandler<DownloadImageQuery, Result<Buffer, ThingsboardApiException>> {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
    ) { }

    async execute(query: DownloadImageQuery): Promise<Result<Buffer, ThingsboardApiException>> {
        try {
            const response = await this.thingsboardApi.downloadImage(
                query.accessToken,
                query.imageLink,
            );

            return Ok(response);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
