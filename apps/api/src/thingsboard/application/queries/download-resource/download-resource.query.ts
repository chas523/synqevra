import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

export class DownloadResourceQuery extends Query<
    Result<Buffer, ThingsboardApiException>
> {
    constructor(public readonly resourceId: string) {
        super();
    }
}
