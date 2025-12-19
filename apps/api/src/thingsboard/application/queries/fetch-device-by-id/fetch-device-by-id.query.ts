import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { DeviceDetails } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-device.response.dto';

export type FetchDeviceByIdProps = {
  accessToken: string;
  id: string;
};

export class FetchDeviceByIdQuery extends Query<
  Result<DeviceDetails, ThingsboardApiException>
> {
  public readonly accessToken: string;
  public readonly id: string;

  constructor(props: FetchDeviceByIdProps) {
    super();
    this.accessToken = props.accessToken;
    this.id = props.id;
  }
}
