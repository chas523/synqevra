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
import { ConfigService } from '@nestjs/config';

@QueryHandler(FetchWidgetTypesQuery)
export class FetchWidgetTypesQueryHandler
    implements IQueryHandler<FetchWidgetTypesQuery, Result<WidgetTypesPageDto, ThingsboardApiException>> {
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

    async execute(query: FetchWidgetTypesQuery): Promise<Result<WidgetTypesPageDto, ThingsboardApiException>> {
        try {
            const loginResponse = await this.thingsboardApi.loginToSysadminAccount(
                this.THINGSBOARD_SYSADMIN_EMAIL,
                this.THINGSBOARD_SYSADMIN_PASSWORD,
            );

            const widgetTypes = await this.thingsboardApi.fetchWidgetTypes(
                loginResponse.token,
                query.page,
                query.pageSize,
                query.sortProperty,
                query.sortOrder,
                query.tenantOnly,
                query.fullSearch,
                query.scadaFirst,
                query.deprecatedFilter,
            );

            return Ok(widgetTypes);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
