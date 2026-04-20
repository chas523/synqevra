import { IQuery } from '@nestjs/cqrs';

export class FetchEntityTelemetryKeysQuery implements IQuery {
  constructor(
    public readonly accessToken: string,
    public readonly entityType: string,
    public readonly entityId: string,
  ) {}
}
