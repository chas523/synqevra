import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchTenantProfileAttributesQuery } from './fetch-tenant-profile-attributes.query';
import { Err, Ok, Result } from 'oxide.ts';
import { Logger, Inject } from '@nestjs/common';
import { TenantAttributesResponse } from '../../ports/thingsboard.api.port';

import { TBAdminGetError } from '../../../domain/errors/thingsboard-admin.errors';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';

@QueryHandler(FetchTenantProfileAttributesQuery)
export class FetchTenantProfileAttributesQueryHandler implements IQueryHandler<
  FetchTenantProfileAttributesQuery,
  Result<TenantAttributesResponse, TBAdminGetError>
> {
  private readonly logger = new Logger(
    FetchTenantProfileAttributesQueryHandler.name,
  );

  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchTenantProfileAttributesQuery,
  ): Promise<Result<TenantAttributesResponse, TBAdminGetError>> {
    const { tenantProfileId, scope, accessToken } = query;

    try {
      const response = await this.thingsboardApi.fetchEntityAttributes(
        accessToken!,
        'TENANT_PROFILE',
        tenantProfileId,
        scope,
      );

      return Ok(response);
    } catch (error) {
      this.logger.error('Error fetching tenant profile attributes', error);
      return Err(new TBAdminGetError());
    }
  }
}
