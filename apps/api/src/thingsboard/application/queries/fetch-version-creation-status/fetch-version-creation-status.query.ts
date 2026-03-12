import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

export class FetchVersionCreationStatusQuery extends Query<
  Result<any, ThingsboardApiException>
> {
  constructor(
    public readonly accessToken: string,
    public readonly requestId: string,
  ) {
    super();
  }
}
