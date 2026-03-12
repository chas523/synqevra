import { IQuery } from '@nestjs/cqrs';

export class FetchAuditLogsQuery implements IQuery {
  constructor(
    public readonly accessToken: string,
    public readonly params: {
      pageSize: number;
      page: number;
      sortProperty: string;
      sortOrder: string;
      startTime: number;
      endTime: number;
    },
  ) {}
}
