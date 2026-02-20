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

@QueryHandler(FetchTenantsQuery)
export class FetchTenantsQueryHandler implements IQueryHandler<
  FetchTenantsQuery,
  Result<GetTenantsResponse, TBAdminGetError>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) { }

  private readonly logger = new Logger(FetchTenantsQueryHandler.name);


  async execute(
    query: FetchTenantsQuery,
  ): Promise<Result<GetTenantsResponse, TBAdminGetError>> {
    const { page, pageSize } = query;

    try {
      const response = await this.thingsboardApi.fetchTenants(
        query.accessToken,
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
