import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { GetTenantUsersResponse } from '../../../interface/rest/dtos/response/thingsboard-get-tenant-users.response.dto';
import { TBAdminGetTenantsUsersError } from '../../../domain/errors/thingsboard-admin.errors';

export type FetchTenantUsersProps = {
  tenantId: string;
  page?: number;
  pageSize?: number;
};

export class FetchTenantUsersQuery extends Query<
  Result<GetTenantUsersResponse, TBAdminGetTenantsUsersError>
> {
  public readonly tenantId: string;
  public readonly page: number;
  public readonly pageSize: number;

  constructor(props: FetchTenantUsersProps) {
    super();
    this.tenantId = props.tenantId;
    this.page = props.page ?? 0;
    this.pageSize = props.pageSize ?? 10;
  }
}
