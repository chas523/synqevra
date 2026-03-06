import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { LatestTelemetryResponse } from 'src/thingsboard/application/ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

export class FetchDeviceLatestTelemetryQuery extends Query<
  Result<LatestTelemetryResponse, ThingsboardApiException>
> {
  public readonly accessToken: string;
  public readonly id: string;
  public readonly keys: string[];

  constructor(accessToken: string, id: string, keys: string[]) {
    super();
    this.accessToken = accessToken;
    this.id = id;
    this.keys = keys;
  }
}
