import { IQuery } from '@nestjs/cqrs';

export class FetchEntityTelemetryQuery implements IQuery {
  constructor(
    public readonly accessToken: string,
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly keys?: string[],
  ) {}
}
