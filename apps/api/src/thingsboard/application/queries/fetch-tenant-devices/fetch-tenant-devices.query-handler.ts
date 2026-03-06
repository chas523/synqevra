import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchTenantDevicesQuery } from './fetch-tenant-devices.query';
import { Err, Ok, Result } from 'oxide.ts';
import { GetTenantDevicesResponse } from '../../../interface/rest/dtos/response/thingsboard-get-tenant-devices.response.dto';
import { TBAdminGetTenantDevicesError } from '../../../domain/errors/thingsboard-admin.errors';
import { Inject, Logger } from '@nestjs/common';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ConfigService } from '@nestjs/config';

@QueryHandler(FetchTenantDevicesQuery)
export class FetchTenantDevicesQueryHandler implements IQueryHandler<
  FetchTenantDevicesQuery,
  Result<GetTenantDevicesResponse, TBAdminGetTenantDevicesError>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  private readonly logger = new Logger(FetchTenantDevicesQueryHandler.name);

  async execute(
    query: FetchTenantDevicesQuery,
  ): Promise<Result<GetTenantDevicesResponse, TBAdminGetTenantDevicesError>> {
    try {
      const response = await this.thingsboardApi.fetchTenantDevices(
        query.accessToken,
        query.tenantId,
        query.page,
        query.pageSize,
      );
      return Ok(response);
    } catch (error) {
      this.logger.error('Error fetching tenant devices', error);
      return Err(new TBAdminGetTenantDevicesError());
    }
  }
}
