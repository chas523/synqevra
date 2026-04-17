import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import { FetchEntityAuditLogsQuery } from './fetch-entity-audit-logs.query';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@QueryHandler(FetchEntityAuditLogsQuery)
export class FetchEntityAuditLogsQueryHandler implements IQueryHandler<
  FetchEntityAuditLogsQuery,
  Result<any, ThingsboardApiException>
> {
  private readonly logger = new Logger(FetchEntityAuditLogsQueryHandler.name);

  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchEntityAuditLogsQuery,
  ): Promise<Result<any, ThingsboardApiException>> {
    const {
      accessToken,
      entityType,
      entityId,
      page,
      pageSize,
      sortProperty,
      sortOrder,
      startTime,
      endTime,
    } = query;

    try {
      this.logger.log(`Fetching audit logs for ${entityType}/${entityId}`);
      const data = await this.thingsboardApi.fetchEntityAuditLogs(
        accessToken,
        entityType,
        entityId,
        page,
        pageSize,
        sortProperty,
        sortOrder,
        startTime,
        endTime,
      );
      return Ok(data);
    } catch (error) {
      this.logger.error('Error fetching entity audit logs', error);
      return Err(error as ThingsboardApiException);
    }
  }
}
