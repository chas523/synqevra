import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';

import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { ResourcesPageResponseDto } from 'src/thingsboard/interface/rest/dtos/response/resource.response.dto';

export class FetchResourcesQuery extends Query<
    Result<ResourcesPageResponseDto, ThingsboardApiException>
> {
    constructor(
        public readonly page: number = 0,
        public readonly pageSize: number = 10,
        public readonly sortProperty: string = 'createdTime',
        public readonly sortOrder: 'ASC' | 'DESC' = 'DESC',
        public readonly resourceType?: string,
    ) {
        super();
    }
}
