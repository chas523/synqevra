import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

export class FetchRepoSettingsInfoQuery extends Query<
    Result<any, ThingsboardApiException>
> {
    public readonly accessToken: string;

    constructor(accessToken: string) {
        super();
        this.accessToken = accessToken;
    }
}
