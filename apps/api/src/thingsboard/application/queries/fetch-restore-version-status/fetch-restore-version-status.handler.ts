import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchRestoreVersionStatusQuery } from './fetch-restore-version-status.query';
import { Inject, Logger } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import { THINGSBOARD_API_PORT, ThingsboardApiPort } from '../../../application/ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@QueryHandler(FetchRestoreVersionStatusQuery)
export class FetchRestoreVersionStatusHandler implements IQueryHandler<FetchRestoreVersionStatusQuery, Result<any, ThingsboardApiException>> {
    private readonly logger = new Logger(FetchRestoreVersionStatusHandler.name);

    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApiPort: ThingsboardApiPort,
    ) { }

    async execute(query: FetchRestoreVersionStatusQuery): Promise<Result<any, ThingsboardApiException>> {
        this.logger.debug(`Executing FetchRestoreVersionStatusQuery  for requestId: ${query.requestId}`);
        try {
            const response = await this.thingsboardApiPort.getRestoreVersionStatus(query.accessToken, query.requestId);
            return Ok(response);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
