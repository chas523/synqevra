import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { match, Result } from 'oxide.ts';
import {
  TBAdminGetError,
  TBAdminGetNotificationsError,
  TBAdminGetTenantDevicesError,
  TBAdminGetTenantsUsersError,
} from '../../domain/errors/thingsboard-admin.errors';
import { GetTenantsResponse } from './dtos/response/thingsboard-get-tenants.response.dto';
import { FetchTenantsQuery } from '../../application/queries/fetch-tenants/fetch-tenants.query';
import { FetchTenantDevicesQuery } from '../../application/queries/fetch-tenant-devices/fetch-tenant-devices.query';
import { FetchTenantUsersQuery } from '../../application/queries/fetch-users-by-tenant/fetch-tenant-users.query';
import { GetTenantUsersResponse } from './dtos/response/thingsboard-get-tenant-users.response.dto';
import { GetTenantDevicesResponse } from './dtos/response/thingsboard-get-tenant-devices.response.dto';
import { FetchNotificationsQuery } from '../../application/queries/fetch-notifications/fetch-notifications.query';
import { GetNotificationsResponse } from './dtos/response/thingsboard-get-notifications.response.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/tenants')
  async getTenants(@Query('page') page = 0, @Query('pageSize') pageSize = 20) {
    const query = new FetchTenantsQuery({
      page: Number(page),
      pageSize: Number(pageSize),
    });
    const result: Result<GetTenantsResponse, TBAdminGetError> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (dto: GetTenantsResponse) => dto,
      Err: (error: TBAdminGetError) => {
        throw error;
      },
    });
  }

  @Get('/tenants/:id/users')
  async getTenantUsers(
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 20,
    @Param('id') id: string,
  ) {
    const query = new FetchTenantUsersQuery({
      tenantId: id,
      page: Number(page),
      pageSize: Number(pageSize),
    });
    const result: Result<GetTenantUsersResponse, TBAdminGetTenantsUsersError> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (dto: GetTenantUsersResponse) => dto,
      Err: (error: TBAdminGetTenantsUsersError) => {
        throw error;
      },
    });
  }

  @Get('/tenants/:id/devices')
  async getTenantDevices(
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 20,
    @Param('id') id: string,
  ) {
    const query = new FetchTenantDevicesQuery({
      tenantId: id,
      page: Number(page),
      pageSize: Number(pageSize),
    });
    const result: Result<
      GetTenantDevicesResponse,
      TBAdminGetTenantDevicesError
    > = await this.queryBus.execute(query);

    return match(result, {
      Ok: (dto: GetTenantDevicesResponse) => dto,
      Err: (error: TBAdminGetTenantDevicesError) => {
        throw error;
      },
    });
  }

  @Get('/notifications')
  async getNotifications(
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 20,
  ) {
    const query = new FetchNotificationsQuery({
      page: Number(page),
      pageSize: Number(pageSize),
    });

    const result: Result<
      GetNotificationsResponse,
      TBAdminGetNotificationsError
    > = await this.queryBus.execute(query);

    return match(result, {
      Ok: (dto: GetNotificationsResponse) => dto,
      Err: (error: TBAdminGetNotificationsError) => {
        throw error;
      },
    });
  }
}
