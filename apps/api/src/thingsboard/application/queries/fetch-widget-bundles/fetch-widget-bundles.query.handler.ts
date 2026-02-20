import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { FetchWidgetBundlesQuery } from './fetch-widget-bundles.query';
import { WidgetBundlesPageDto } from 'src/thingsboard/interface/rest/dtos/response/widget-bundles.response.dto';
import { ConfigService } from '@nestjs/config';

@QueryHandler(FetchWidgetBundlesQuery)
export class FetchWidgetBundlesQueryHandler
    implements IQueryHandler<FetchWidgetBundlesQuery, Result<WidgetBundlesPageDto, ThingsboardApiException>> {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
    ) { }

    async execute(query: FetchWidgetBundlesQuery): Promise<Result<WidgetBundlesPageDto, ThingsboardApiException>> {
        try {
            const widgetBundles = await this.thingsboardApi.fetchWidgetBundles(
                query.accessToken,
                query.page,
                query.pageSize,
                query.sortProperty,
                query.sortOrder,
                query.tenantOnly,
                query.fullSearch,
                query.scadaFirst,
            );

            return Ok(widgetBundles);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
