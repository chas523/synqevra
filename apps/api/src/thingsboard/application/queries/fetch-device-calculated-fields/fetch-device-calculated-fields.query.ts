import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { DeviceCalculatedFieldsResponse } from 'src/thingsboard/application/ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

export class FetchDeviceCalculatedFieldsQuery extends Query<
  Result<DeviceCalculatedFieldsResponse, ThingsboardApiException>
> {
  public readonly accessToken: string;
  public readonly id: string;
  public readonly page: number;
  public readonly pageSize: number;
  public readonly sortProperty: string;
  public readonly sortOrder: 'ASC' | 'DESC';

  constructor(
    accessToken: string,
    id: string,
    page: number,
    pageSize: number,
    sortProperty = 'createdTime',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ) {
    super();
    this.accessToken = accessToken;
    this.id = id;
    this.page = page;
    this.pageSize = pageSize;
    this.sortProperty = sortProperty;
    this.sortOrder = sortOrder;
  }
}
