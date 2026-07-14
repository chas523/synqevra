import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

export class FetchMaterialIconsQuery extends Query<
  Result<string[], ThingsboardApiException>
> {
  constructor(public readonly accessToken: string) {
    super();
  }
}
