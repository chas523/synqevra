import { IQuery } from '@nestjs/cqrs';

export class FetchEntityAlarmsQuery implements IQuery {
  constructor(
    public readonly accessToken: string,
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly page: number,
    public readonly pageSize: number,
    public readonly statusList?: string[],
    public readonly severityList?: string[],
    public readonly startTime?: number,
    public readonly endTime?: number,
  ) {}
}
