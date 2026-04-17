import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import { FetchEntityAlarmsQuery } from './fetch-entity-alarms.query';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@QueryHandler(FetchEntityAlarmsQuery)
export class FetchEntityAlarmsQueryHandler implements IQueryHandler<
  FetchEntityAlarmsQuery,
  Result<any, ThingsboardApiException>
> {
  private readonly logger = new Logger(FetchEntityAlarmsQueryHandler.name);

  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchEntityAlarmsQuery,
  ): Promise<Result<any, ThingsboardApiException>> {
    const {
      accessToken,
      entityType,
      entityId,
      page,
      pageSize,
      statusList,
      severityList,
      startTime,
      endTime,
    } = query;

    try {
      this.logger.log(`Fetching alarms for ${entityType}/${entityId}`);
      const data = await this.thingsboardApi.fetchEntityAlarms(
        accessToken,
        entityType,
        entityId,
        page,
        pageSize,
        statusList,
        severityList,
        startTime,
        endTime,
      );
      return Ok(data);
    } catch (error) {
      this.logger.error('Error fetching entity alarms', error);
      return Err(error as ThingsboardApiException);
    }
  }
}
