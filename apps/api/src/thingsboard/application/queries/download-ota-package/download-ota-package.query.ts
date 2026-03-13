import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

export class DownloadOtaPackageQuery extends Query<
  Result<Buffer, ThingsboardApiException>
> {
  public readonly accessToken: string;
  public readonly id: string;

  constructor(accessToken: string, id: string) {
    super();
    this.accessToken = accessToken;
    this.id = id;
  }
}
