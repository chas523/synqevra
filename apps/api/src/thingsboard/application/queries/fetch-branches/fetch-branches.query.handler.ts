import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { FetchBranchesQuery } from './fetch-branches.query';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@QueryHandler(FetchBranchesQuery)
export class FetchBranchesQueryHandler implements IQueryHandler<
    FetchBranchesQuery,
    Result<any, ThingsboardApiException>
> {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
    ) { }

    async execute(
        query: FetchBranchesQuery,
    ): Promise<Result<any, ThingsboardApiException>> {
        const { accessToken } = query;
        try {
            const response = await this.thingsboardApi.getBranches(accessToken);
            return Ok(response);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
