import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchWidgetTypeFqnsQuery } from './fetch-widget-type-fqns.query';
import { Inject } from '@nestjs/common';
import { THINGSBOARD_API_PORT, ThingsboardApiPort } from '../../ports/thingsboard.api.port';
import { Result, Ok, Err } from 'oxide.ts';
import { ThingsboardApiException } from '../../../infrastructure/http/thingsboard.http.errors';
import { Logger } from '@nestjs/common';

@QueryHandler(FetchWidgetTypeFqnsQuery)
export class FetchWidgetTypeFqnsHandler
    implements IQueryHandler<FetchWidgetTypeFqnsQuery> {
    private readonly logger = new Logger(FetchWidgetTypeFqnsHandler.name);

    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort
    ) { }

    async execute(
        query: FetchWidgetTypeFqnsQuery,
    ): Promise<Result<any, ThingsboardApiException>> {
        const { accessToken, widgetsBundleId } = query;

        try {
            const result = await this.thingsboardApi.getWidgetTypeFqns(
                accessToken,
                widgetsBundleId,
            );
            return Ok(result);
        } catch (error) {
            this.logger.error(
                `Failed to fetch widget type FQNs: ${error}`,
            );
            return Err(error as ThingsboardApiException);
        }
    }
}
