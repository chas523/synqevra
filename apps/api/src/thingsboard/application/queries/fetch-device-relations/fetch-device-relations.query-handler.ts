import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchDeviceRelationsQuery } from './fetch-device-relations.query';
import { Err, Ok, Result } from 'oxide.ts';
import { Logger, Inject } from '@nestjs/common';
import { EntityRelationsResponse } from '../../ports/thingsboard.api.port';

import { TBAdminGetError } from '../../../domain/errors/thingsboard-admin.errors';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';

@QueryHandler(FetchDeviceRelationsQuery)
export class FetchDeviceRelationsQueryHandler implements IQueryHandler<
  FetchDeviceRelationsQuery,
  Result<EntityRelationsResponse, TBAdminGetError>
> {
  private readonly logger = new Logger(FetchDeviceRelationsQueryHandler.name);

  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchDeviceRelationsQuery,
  ): Promise<Result<EntityRelationsResponse, TBAdminGetError>> {
    const { deviceId, direction, accessToken } = query;

    try {
      const response = await this.thingsboardApi.fetchEntityRelations(
        accessToken!,
        'DEVICE',
        deviceId,
        direction,
      );

      return Ok(response);
    } catch (error) {
      this.logger.error('Error fetching device relations', error);
      return Err(new TBAdminGetError());
    }
  }
}
