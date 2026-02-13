import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { SysAdminAuthService } from '../../services/sysadmin-auth.service';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { DownloadImageQuery } from './download-image.query';
import { ConfigService } from '@nestjs/config';

@QueryHandler(DownloadImageQuery)
export class DownloadImageQueryHandler
    implements IQueryHandler<DownloadImageQuery, Result<Buffer, ThingsboardApiException>> {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
        private readonly configService: ConfigService,
        private readonly sysAdminAuthService: SysAdminAuthService,
    ) { }

    async execute(query: DownloadImageQuery): Promise<Result<Buffer, ThingsboardApiException>> {
        try {
            const token = await this.sysAdminAuthService.getAccessToken();

            const response = await this.thingsboardApi.downloadImage(
                token,
                query.imageLink,
            );

            return Ok(response);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
