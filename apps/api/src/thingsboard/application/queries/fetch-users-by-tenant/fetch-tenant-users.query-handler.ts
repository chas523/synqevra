import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchTenantUsersQuery } from './fetch-tenant-users.query';
import { Err, Ok, Result } from 'oxide.ts';
import { GetTenantUsersResponse } from '../../../interface/rest/dtos/response/thingsboard-get-tenant-users.response.dto';
import { TBAdminGetTenantsUsersError } from '../../../domain/errors/thingsboard-admin.errors';
import { Inject, Logger } from '@nestjs/common';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ConfigService } from '@nestjs/config';

@QueryHandler(FetchTenantUsersQuery)
export class FetchTenantUsersQueryHandler implements IQueryHandler<
  FetchTenantUsersQuery,
  Result<GetTenantUsersResponse, TBAdminGetTenantsUsersError>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  private readonly logger = new Logger(FetchTenantUsersQueryHandler.name);

  async execute(
    query: FetchTenantUsersQuery,
  ): Promise<Result<GetTenantUsersResponse, TBAdminGetTenantsUsersError>> {
    const { tenantId, page, pageSize, accessToken } = query;
    try {
      const tenantUsersResponse: GetTenantUsersResponse =
        await this.thingsboardApi.fetchTenantUsers(
          accessToken,
          tenantId,
          page,
          pageSize,
        );
      return Ok(tenantUsersResponse);
    } catch (error) {
      this.logger.error(
        `Error fetching users for tenant with ID ${tenantId}`,
        error,
      );
      return Promise.resolve(Err(error as TBAdminGetTenantsUsersError));
    }
  }
}
