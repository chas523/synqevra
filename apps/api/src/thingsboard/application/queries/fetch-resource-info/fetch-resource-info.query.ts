import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { ResourceDto } from 'src/thingsboard/interface/rest/dtos/response/resource.response.dto';

export class FetchResourceInfoQuery extends Query<
    Result<ResourceDto, ThingsboardApiException>
> {
    constructor(
        public readonly resourceId: string,
        public readonly accessToken: string,
    ) {
        super();
    }
}
