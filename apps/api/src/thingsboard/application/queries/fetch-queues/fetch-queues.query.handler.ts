import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { FetchQueuesQuery } from './fetch-queues.query';
import { QueuesPageResponseDto } from 'src/thingsboard/interface/rest/dtos/response/queue.response.dto';
import { ConfigService } from '@nestjs/config';

@QueryHandler(FetchQueuesQuery)
export class FetchQueuesQueryHandler
    implements
    IQueryHandler<
        FetchQueuesQuery,
        Result<QueuesPageResponseDto, ThingsboardApiException>
    > {
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

    async execute(
        query: FetchQueuesQuery,
    ): Promise<Result<QueuesPageResponseDto, ThingsboardApiException>> {
        try {
            const loginResponse = await this.thingsboardApi.loginToSysadminAccount(
                this.THINGSBOARD_SYSADMIN_EMAIL,
                this.THINGSBOARD_SYSADMIN_PASSWORD,
            );

            const queues = await this.thingsboardApi.fetchQueues(
                loginResponse.token,
                query.page,
                query.pageSize,
                query.sortProperty,
                query.sortOrder,
            );

            return Ok(queues);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
