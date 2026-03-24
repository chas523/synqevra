import { IQuery } from '@nestjs/cqrs';

export class FetchEntityEventsQuery implements IQuery {
  constructor(
    public readonly accessToken: string,
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly tenantId: string,
    public readonly eventType: string,
    public readonly page: number,
    public readonly pageSize: number,
    public readonly sortProperty: string = 'createdTime',
    public readonly sortOrder: 'ASC' | 'DESC' = 'DESC',
    public readonly startTime?: number,
    public readonly endTime?: number,
  ) {}
}
