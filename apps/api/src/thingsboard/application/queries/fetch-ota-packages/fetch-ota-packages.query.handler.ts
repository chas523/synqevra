import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchOtaPackagesQuery } from './fetch-ota-packages.query';
import { Inject } from '@nestjs/common';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { OtaPackagesPageResponseDto } from 'src/thingsboard/interface/rest/dtos/response/ota-package.response.dto';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@QueryHandler(FetchOtaPackagesQuery)
export class FetchOtaPackagesQueryHandler implements IQueryHandler<
    FetchOtaPackagesQuery,
    Result<OtaPackagesPageResponseDto, ThingsboardApiException>
> {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
    ) { }

    async execute(
        query: FetchOtaPackagesQuery,
    ): Promise<Result<OtaPackagesPageResponseDto, ThingsboardApiException>> {
        const { accessToken, page, pageSize, sortProperty, sortOrder } = query;
        try {
            const response = await this.thingsboardApi.fetchOtaPackages(
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
