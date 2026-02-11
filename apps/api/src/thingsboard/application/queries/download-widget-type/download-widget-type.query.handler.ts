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
export class DownloadWidgetTypeQueryHandler
    implements IQueryHandler<DownloadWidgetTypeQuery, Result<any, ThingsboardApiException>> {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
        private readonly configService: ConfigService,
    ) { }

    private get THINGSBOARD_SYSADMIN_EMAIL(): string {
        return this.configService.getOrThrow<string>('THINGSBOARD_SYSADMIN_EMAIL');
    }

    private get THINGSBOARD_SYSADMIN_PASSWORD(): string {
        return this.configService.getOrThrow<string>(
            'THINGSBOARD_SYSADMIN_PASSWORD',
        );
    }

    async execute(query: DownloadWidgetTypeQuery): Promise<Result<any, ThingsboardApiException>> {
        try {
            const loginResponse = await this.thingsboardApi.loginToSysadminAccount(
                this.THINGSBOARD_SYSADMIN_EMAIL,
                this.THINGSBOARD_SYSADMIN_PASSWORD,
            );

            const widgetType = await this.thingsboardApi.downloadWidgetType(
                loginResponse.token,
                query.widgetTypeId,
                query.includeResources
            );

            return Ok(widgetType);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
