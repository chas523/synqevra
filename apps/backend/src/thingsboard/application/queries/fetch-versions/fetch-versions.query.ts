import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

export class FetchVersionsQuery extends Query<
  Result<any, ThingsboardApiException>
> {
  public readonly accessToken: string;
  public readonly page: number;
  public readonly pageSize: number;
  public readonly sortProperty: string;
  public readonly sortOrder: string;
  public readonly branch: string;
  public readonly entityType?: string;
  public readonly entityId?: string;

  constructor(
    accessToken: string,
    page: number = 0,
    pageSize: number = 10,
    sortProperty: string = 'timestamp',
    sortOrder: string = 'DESC',
    branch: string = 'main',
    entityType?: string,
    entityId?: string,
  ) {
    super();
    this.accessToken = accessToken;
    this.page = page;
    this.pageSize = pageSize;
    this.sortProperty = sortProperty;
    this.sortOrder = sortOrder;
    this.branch = branch;
    this.entityType = entityType;
    this.entityId = entityId;
  }
}
