import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

export class FetchAiModelsQuery extends Query<Result<any, ThingsboardApiException>> {
    constructor(
        public readonly accessToken: string,
        public readonly page: number,
        public readonly pageSize: number,
        public readonly sortProperty: string,
        public readonly sortOrder: string,
    ) {
        super();
    }
}
