import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { EntityViewsResponse } from 'src/thingsboard/application/ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

export type FetchEntityViewsProps = {
  accessToken: string;
  page?: number;
  pageSize?: number;
  sortProperty?: string;
  sortOrder?: 'ASC' | 'DESC';
  type?: string;
};

export class FetchEntityViewsQuery extends Query<
  Result<EntityViewsResponse, ThingsboardApiException>
> {
  public readonly accessToken: string;
  public readonly page: number;
  public readonly pageSize: number;
  public readonly sortProperty: string;
  public readonly sortOrder: 'ASC' | 'DESC';
  public readonly type: string;

  constructor(props: FetchEntityViewsProps) {
    super();
    this.accessToken = props.accessToken;
    this.page = props.page ?? 0;
    this.pageSize = props.pageSize ?? 10;
    this.sortProperty = props.sortProperty ?? 'createdTime';
    this.sortOrder = props.sortOrder ?? 'DESC';
    this.type = props.type ?? '';
  }
}
