import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchTenantsQuery } from './fetch-tenants.query';
import { Err, Ok, Result } from 'oxide.ts';
import { TBAdminGetError } from '../../../domain/errors/thingsboard-admin.errors';
import { GetTenantsResponse } from '../../../interface/rest/dtos/response/thingsboard-get-tenants.response.dto';
import { Inject, Logger } from '@nestjs/common';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ConfigService } from '@nestjs/config';

@QueryHandler(FetchTenantsQuery)
export class FetchTenantsQueryHandler implements IQueryHandler<
  FetchTenantsQuery,
  Result<GetTenantsResponse, TBAdminGetError>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
    private readonly configService: ConfigService,
  ) {}

  private readonly logger = new Logger(FetchTenantsQueryHandler.name);

  private get THINGSBOARD_SYSADMIN_EMAIL(): string {
    return this.configService.getOrThrow<string>('THINGSBOARD_SYSADMIN_EMAIL');
  }

  private get THINGSBOARD_SYSADMIN_PASSWORD(): string {
    return this.configService.getOrThrow<string>(
      'THINGSBOARD_SYSADMIN_PASSWORD',
    );
  }

  async execute(
    query: FetchTenantsQuery,
  ): Promise<Result<GetTenantsResponse, TBAdminGetError>> {
    const { page, pageSize } = query;

    try {
      const loginResponse = await this.thingsboardApi.loginToSysadminAccount(
        this.THINGSBOARD_SYSADMIN_EMAIL,
        this.THINGSBOARD_SYSADMIN_PASSWORD,
      );

      const sysAdminAccessToken = loginResponse.token;

      const response = await this.thingsboardApi.fetchTenants(
        sysAdminAccessToken,
        page,
        pageSize,
      );

      return Ok(response);
    } catch (error) {
      this.logger.error('Error fetching tenants', error);

      return Err(new TBAdminGetError());
    }
  }
}
