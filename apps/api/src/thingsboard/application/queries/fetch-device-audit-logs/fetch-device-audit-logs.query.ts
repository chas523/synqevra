import { IQuery } from '@nestjs/cqrs';

export class FetchDeviceAuditLogsQuery implements IQuery {
  constructor(
    public readonly deviceId: string,
    public readonly page: number,
    public readonly pageSize: number,
    public readonly sortProperty: string,
    public readonly sortOrder: 'ASC' | 'DESC',
    public readonly startTime: number | undefined,
    public readonly endTime: number | undefined,
    public readonly accessToken: string,
  ) {}
}
