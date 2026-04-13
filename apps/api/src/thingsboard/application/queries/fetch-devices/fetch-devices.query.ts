import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { DevicesResponse } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-devices.response.dto';

export type FetchDevicesProps = {
  accessToken: string;
  page?: number;
  pageSize?: number;
  sortProperty?: string;
  sortOrder?: 'ASC' | 'DESC';
  deviceIds?: string;
};

export class FetchDevicesQuery extends Query<
  Result<DevicesResponse, ThingsboardApiException>
> {
  public readonly accessToken: string;
  public readonly page: number;
  public readonly pageSize: number;
  public readonly sortProperty: string;
  public readonly sortOrder: 'ASC' | 'DESC';
  public readonly deviceIds: string | undefined;

  constructor(props: FetchDevicesProps) {
    super();
    this.accessToken = props.accessToken;
    this.page = props.page ?? 0;
    this.pageSize = props.pageSize ?? 10;
    this.sortProperty = props.sortProperty ?? 'createdTime';
    this.sortOrder = props.sortOrder ?? 'DESC';
    this.deviceIds = props.deviceIds;
  }
}
