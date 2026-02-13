import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchDeliveryMethodsQuery } from './fetch-delivery-methods.query';
import { Err, Ok, Result } from 'oxide.ts';
import { DeliveryMethodsResponse } from '../../../interface/rest/dtos/response/delivery-methods.response.dto';
import { ThingsboardApiException } from '../../../infrastructure/http/thingsboard.http.errors';
import { Inject, Logger } from '@nestjs/common';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { SysAdminAuthService } from '../../services/sysadmin-auth.service';

@QueryHandler(FetchDeliveryMethodsQuery)
export class FetchDeliveryMethodsQueryHandler
    implements
    IQueryHandler<
        FetchDeliveryMethodsQuery,
        Result<DeliveryMethodsResponse, ThingsboardApiException>
    > {
    private readonly logger = new Logger(FetchDeliveryMethodsQueryHandler.name);

    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
        private readonly sysAdminAuthService: SysAdminAuthService,
    ) { }

    async execute(
        query: FetchDeliveryMethodsQuery,
    ): Promise<Result<DeliveryMethodsResponse, ThingsboardApiException>> {
        try {
            const sysAdminAccessToken =
                await this.sysAdminAuthService.getAccessToken();

            const response =
                await this.thingsboardApi.fetchDeliveryMethods(sysAdminAccessToken);

            return Ok(response);
        } catch (error) {
            this.logger.error('Error fetching delivery methods', error);
            return Err(error as ThingsboardApiException);
        }
    }
}
