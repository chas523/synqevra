import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import { FetchAuditLogsQuery } from './fetch-audit-logs.query';
import { THINGSBOARD_API_PORT, ThingsboardApiPort } from '../../ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@QueryHandler(FetchAuditLogsQuery)
export class FetchAuditLogsQueryHandler implements IQueryHandler<FetchAuditLogsQuery, Result<any, ThingsboardApiException>> {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
    ) { }

    async execute(query: FetchAuditLogsQuery): Promise<Result<any, ThingsboardApiException>> {
        try {
            const data = await this.thingsboardApi.getAuditLogs(query.accessToken, query.params);
            return Ok(data);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
