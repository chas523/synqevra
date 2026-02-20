import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ExportImageQuery } from './export-image.query';
import { ImageExportDto } from 'src/thingsboard/interface/rest/dtos/response/image.response.dto';
import { ConfigService } from '@nestjs/config';

@QueryHandler(ExportImageQuery)
export class ExportImageQueryHandler
    implements IQueryHandler<ExportImageQuery, Result<ImageExportDto, ThingsboardApiException>> {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
    ) { }

    async execute(query: ExportImageQuery): Promise<Result<ImageExportDto, ThingsboardApiException>> {
        try {
            const response = await this.thingsboardApi.exportImage(
                query.accessToken,
                query.imageLink,
            );

            return Ok(response);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
