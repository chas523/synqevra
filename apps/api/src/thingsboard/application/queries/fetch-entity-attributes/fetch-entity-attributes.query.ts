import { IQuery } from '@nestjs/cqrs';

export class FetchEntityAttributesQuery implements IQuery {
  constructor(
    public readonly accessToken: string,
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly scope: 'SERVER_SCOPE' | 'CLIENT_SCOPE' | 'SHARED_SCOPE' = 'SERVER_SCOPE',
    public readonly keys?: string[],
  ) {}
}
