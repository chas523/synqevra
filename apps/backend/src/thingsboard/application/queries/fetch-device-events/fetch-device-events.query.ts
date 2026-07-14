import { IQuery } from '@nestjs/cqrs';

export class FetchDeviceEventsQuery implements IQuery {
  constructor(
    public readonly deviceId: string,
    public readonly page: number,
    public readonly pageSize: number,
    public readonly eventType: string | undefined,
    public readonly startTime: number | undefined,
    public readonly endTime: number | undefined,
    public readonly accessToken: string,
  ) {}
}
