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
    ) { }

    async execute(query: FetchWidgetBundleByIdQuery): Promise<Result<WidgetBundleDto, ThingsboardApiException>> {
        try {
            const widgetBundle = await this.thingsboardApi.fetchWidgetBundleById(
                query.accessToken,
                query.bundleId,
            );

            return Ok(widgetBundle);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
