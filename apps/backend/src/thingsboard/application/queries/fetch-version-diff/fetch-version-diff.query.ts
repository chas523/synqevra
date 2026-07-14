import { Query } from '@nestjs/cqrs';

export class FetchVersionDiffQuery extends Query<any> {
  constructor(
    public readonly accessToken: string,
    public readonly entityType: string,
    public readonly entityId: string,
    public readonly versionId: string,
  ) {
    super();
  }
}
