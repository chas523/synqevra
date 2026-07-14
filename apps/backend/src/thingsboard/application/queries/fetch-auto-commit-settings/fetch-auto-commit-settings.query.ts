import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

export class FetchAutoCommitSettingsQuery extends Query<
  Result<any, ThingsboardApiException>
> {
  constructor(public readonly accessToken: string) {
    super();
  }
}
