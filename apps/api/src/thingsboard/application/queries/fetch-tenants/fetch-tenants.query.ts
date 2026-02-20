import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { TBAdminGetError } from '../../../domain/errors/thingsboard-admin.errors';
import { GetTenantsResponse } from '../../../interface/rest/dtos/response/thingsboard-get-tenants.response.dto';

export type FetchTenantsProps = {
  page?: number;
  pageSize?: number;

};

export class FetchTenantsQuery extends Query<
  Result<GetTenantsResponse, TBAdminGetError>
> {
  public readonly page: number;
  public readonly pageSize: number;
  public readonly accessToken: string;

  constructor(props: FetchTenantsProps, accessToken: string) {
    super();
    this.page = props.page ?? 0;
    this.pageSize = props.pageSize ?? 10;
    this.accessToken = accessToken;
  }
}
