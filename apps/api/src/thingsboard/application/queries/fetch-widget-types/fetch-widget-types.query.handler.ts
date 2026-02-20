import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { FetchWidgetTypesQuery } from './fetch-widget-types.query';
import { WidgetTypesPageDto } from 'src/thingsboard/interface/rest/dtos/response/widget-types.response.dto';

@QueryHandler(FetchWidgetTypesQuery)
export class FetchWidgetTypesQueryHandler
    implements IQueryHandler<FetchWidgetTypesQuery, Result<WidgetTypesPageDto, ThingsboardApiException>> {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,

    ) { }

    async execute(query: FetchWidgetTypesQuery): Promise<Result<WidgetTypesPageDto, ThingsboardApiException>> {
        try {
            const { accessToken } = query

            const widgetTypes = await this.thingsboardApi.fetchWidgetTypes(
                accessToken,
                query.page,
                query.pageSize,
                query.sortProperty,
                query.sortOrder,
                query.tenantOnly,
                query.fullSearch,
                query.scadaFirst,
                query.deprecatedFilter,
                query.widgetsBundleId,
            );

            return Ok(widgetTypes);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
