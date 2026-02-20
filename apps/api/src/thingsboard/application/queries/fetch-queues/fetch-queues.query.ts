import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';

import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { QueuesPageResponseDto } from 'src/thingsboard/interface/rest/dtos/response/queue.response.dto';

export class FetchQueuesQuery extends Query<
    Result<QueuesPageResponseDto, ThingsboardApiException>
> {
    constructor(
        public readonly accessToken: string,
        public readonly page: number = 0,
        public readonly pageSize: number = 10,
        public readonly sortProperty: string = 'createdTime',
        public readonly sortOrder: 'ASC' | 'DESC' = 'DESC',
    ) {
        super();
    }
}
