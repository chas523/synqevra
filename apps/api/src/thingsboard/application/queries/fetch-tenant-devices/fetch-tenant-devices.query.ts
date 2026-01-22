import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { GetTenantDevicesResponse } from '../../../interface/rest/dtos/response/thingsboard-get-tenant-devices.response.dto';
import { TBAdminGetTenantDevicesError } from '../../../domain/errors/thingsboard-admin.errors';

export type FetchTenantDevicesProps = {
  tenantId: string;
  page?: number;
  pageSize?: number;
};

export class FetchTenantDevicesQuery extends Query<
  Result<GetTenantDevicesResponse, TBAdminGetTenantDevicesError>
> {
  public readonly tenantId: string;
  public readonly page: number = 0;
  public readonly pageSize: number = 20;

  constructor(props: FetchTenantDevicesProps) {
    super();
    this.tenantId = props.tenantId;
    this.page = props.page ?? 0;
    this.pageSize = props.pageSize ?? 20;
  }
}
