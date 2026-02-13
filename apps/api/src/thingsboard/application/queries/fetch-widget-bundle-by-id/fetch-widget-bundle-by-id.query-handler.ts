import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { FetchWidgetBundleByIdQuery } from './fetch-widget-bundle-by-id.query';
import { WidgetBundleDto } from 'src/thingsboard/interface/rest/dtos/response/widget-bundles.response.dto';
import { ConfigService } from '@nestjs/config';

@QueryHandler(FetchWidgetBundleByIdQuery)
export class FetchWidgetBundleByIdQueryHandler
    implements IQueryHandler<FetchWidgetBundleByIdQuery, Result<WidgetBundleDto, ThingsboardApiException>> {
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

    async execute(query: FetchWidgetBundleByIdQuery): Promise<Result<WidgetBundleDto, ThingsboardApiException>> {
        try {
            const loginResponse = await this.thingsboardApi.loginToSysadminAccount(
                this.THINGSBOARD_SYSADMIN_EMAIL,
                this.THINGSBOARD_SYSADMIN_PASSWORD,
            );

            const widgetBundle = await this.thingsboardApi.fetchWidgetBundleById(
                loginResponse.token,
                query.bundleId,
            );

            return Ok(widgetBundle);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
