import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

export class FetchDeviceProfileInfosQuery extends Query<
  Result<any, ThingsboardApiException>
> {
  public readonly accessToken: string;
  public readonly page: number;
  public readonly pageSize: number;
  public readonly sortProperty: string;
  public readonly sortOrder: 'ASC' | 'DESC';

  constructor(
    accessToken: string,
    page: number = 0,
    pageSize: number = 100,
    sortProperty: string = 'name',
    sortOrder: 'ASC' | 'DESC' = 'ASC',
  ) {
    super();
    this.accessToken = accessToken;
    this.page = page;
    this.pageSize = pageSize;
    this.sortProperty = sortProperty;
    this.sortOrder = sortOrder;
  }
}
