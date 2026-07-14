import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { GetTenantDevicesResponse } from '../../../interface/rest/dtos/response/thingsboard-get-tenant-devices.response.dto';
import { TBAdminGetTenantDevicesError } from '../../../domain/errors/thingsboard-admin.errors';

export type FetchTenantDevicesProps = {
  tenantId: string;
  page?: number;
  pageSize?: number;
  sortProperty?: string;
  sortOrder?: 'ASC' | 'DESC';
};

export class FetchTenantDevicesQuery extends Query<
  Result<GetTenantDevicesResponse, TBAdminGetTenantDevicesError>
> {
  public readonly tenantId: string;
  public readonly page: number = 0;
  public readonly pageSize: number = 20;
  public readonly sortProperty: string;
  public readonly sortOrder: 'ASC' | 'DESC';
  public readonly accessToken: string;

  constructor(props: FetchTenantDevicesProps, accessToken: string) {
    super();
    this.tenantId = props.tenantId;
    this.page = props.page ?? 0;
    this.pageSize = props.pageSize ?? 20;
    this.sortProperty = props.sortProperty ?? 'createdTime';
    this.sortOrder = props.sortOrder ?? 'DESC';
    this.accessToken = accessToken;
  }
}
