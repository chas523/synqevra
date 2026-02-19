import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchTenantRelationsQuery } from './fetch-tenant-relations.query';
import { Err, Ok, Result } from 'oxide.ts';
import { Logger, Inject } from '@nestjs/common';
import { EntityRelationsResponse } from '../../ports/thingsboard.api.port';
import { SysAdminAuthService } from '../../services/sysadmin-auth.service';
import { TBAdminGetError } from '../../../domain/errors/thingsboard-admin.errors';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';

@QueryHandler(FetchTenantRelationsQuery)
export class FetchTenantRelationsQueryHandler implements IQueryHandler<
  FetchTenantRelationsQuery,
  Result<EntityRelationsResponse, TBAdminGetError>
> {
  private readonly logger = new Logger(FetchTenantRelationsQueryHandler.name);

  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) { }

  async execute(
    query: FetchTenantRelationsQuery,
  ): Promise<Result<EntityRelationsResponse, TBAdminGetError>> {
    const { tenantId, direction, accessToken } = query;

    try {

      const response = await this.thingsboardApi.fetchEntityRelations(
        accessToken!,
        'TENANT',
        tenantId,
        direction,
      );

      return Ok(response);
    } catch (error) {
      this.logger.error('Error fetching tenant relations', error);
      return Err(new TBAdminGetError());
    }
  }
}
