import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchDeviceEventsQuery } from './fetch-device-events.query';
import { Inject } from '@nestjs/common';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
  EntityEventsResponse,
} from '../../ports/thingsboard.api.port';
import { Ok, Err, Result } from 'oxide.ts';
import { TBAdminGetError } from '../../../domain/errors/thingsboard-admin.errors';

@QueryHandler(FetchDeviceEventsQuery)
export class FetchDeviceEventsQueryHandler implements IQueryHandler<
  FetchDeviceEventsQuery,
  Result<EntityEventsResponse, TBAdminGetError>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchDeviceEventsQuery,
  ): Promise<Result<EntityEventsResponse, TBAdminGetError>> {
    try {
      const response = await this.thingsboardApi.fetchEntityEvents(
        query.accessToken,
        'DEVICE',
        query.deviceId,
        query.page,
        query.pageSize,
        query.eventType,
        query.startTime,
        query.endTime,
      );

      return Ok(response);
    } catch (error) {
      return Err(new TBAdminGetError());
    }
  }
}
