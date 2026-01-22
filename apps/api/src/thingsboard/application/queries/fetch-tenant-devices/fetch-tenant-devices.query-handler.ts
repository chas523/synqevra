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
    private readonly configService: ConfigService,
  ) {}

  private readonly logger = new Logger(FetchTenantDevicesQueryHandler.name);

  private get THINGSBOARD_SYSADMIN_EMAIL(): string {
    return this.configService.getOrThrow<string>('THINGSBOARD_SYSADMIN_EMAIL');
  }

  private get THINGSBOARD_SYSADMIN_PASSWORD(): string {
    return this.configService.getOrThrow<string>(
      'THINGSBOARD_SYSADMIN_PASSWORD',
    );
  }

  async execute(
    query: FetchTenantDevicesQuery,
  ): Promise<Result<GetTenantDevicesResponse, TBAdminGetTenantDevicesError>> {
    try {
      const loginResponse = await this.thingsboardApi.loginToSysadminAccount(
        this.THINGSBOARD_SYSADMIN_EMAIL,
        this.THINGSBOARD_SYSADMIN_PASSWORD,
      );

      const response = await this.thingsboardApi.fetchTenantDevices(
        loginResponse.token,
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
