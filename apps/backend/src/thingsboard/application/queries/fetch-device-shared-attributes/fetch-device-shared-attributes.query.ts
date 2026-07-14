import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { DeviceAttributes } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-device-attributes.response.dto';

export class FetchDeviceSharedAttributesQuery extends Query<
  Result<DeviceAttributes, ThingsboardApiException>
> {
  public readonly accessToken: string;
  public readonly id: string;

  constructor(accessToken: string, id: string) {
    super();
    this.accessToken = accessToken;
    this.id = id;
  }
}
