import { IQuery } from '@nestjs/cqrs';

export class FetchEntityRelationsQuery implements IQuery {
  constructor(
    public readonly accessToken: string,
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly direction: 'FROM' | 'TO' = 'FROM',
  ) {}
}
