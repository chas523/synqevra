import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchNotificationsQuery } from './fetch-notifications.query';
import { Err, Ok, Result } from 'oxide.ts';
import { GetNotificationsResponse } from '../../../interface/rest/dtos/response/thingsboard-get-notifications.response.dto';
import { TBAdminGetNotificationsError } from '../../../domain/errors/thingsboard-admin.errors';
import { Inject, Logger } from '@nestjs/common';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ConfigService } from '@nestjs/config';

@QueryHandler(FetchNotificationsQuery)
export class FetchNotificationsQueryHandler implements IQueryHandler<
  FetchNotificationsQuery,
  Result<GetNotificationsResponse, TBAdminGetNotificationsError>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  private readonly logger = new Logger(FetchNotificationsQueryHandler.name);

  async execute(
    query: FetchNotificationsQuery,
  ): Promise<Result<GetNotificationsResponse, TBAdminGetNotificationsError>> {
    const { page, pageSize, accessToken } = query;

    try {
      const response = await this.thingsboardApi.fetchNotifications(
        accessToken,
        page,
        pageSize,
      );

      return Ok(response);
    } catch (error) {
      this.logger.error('Error fetching notifications', error);
      return Err(new TBAdminGetNotificationsError());
    }
  }
}
