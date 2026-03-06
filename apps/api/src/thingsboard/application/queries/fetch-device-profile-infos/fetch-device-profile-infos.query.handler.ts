import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchDeviceProfileInfosQuery } from './fetch-device-profile-infos.query';
import { Inject } from '@nestjs/common';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@QueryHandler(FetchDeviceProfileInfosQuery)
export class FetchDeviceProfileInfosQueryHandler implements IQueryHandler<
    FetchDeviceProfileInfosQuery,
    Result<any, ThingsboardApiException>
> {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
    ) { }

    async execute(
        query: FetchDeviceProfileInfosQuery,
    ): Promise<Result<any, ThingsboardApiException>> {
        const { accessToken, page, pageSize, sortProperty, sortOrder } = query;
        try {
            const response = await this.thingsboardApi.fetchDeviceProfileInfos(
                accessToken,
                page,
                pageSize,
                sortProperty,
                sortOrder,
            );
            return Ok(response);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
