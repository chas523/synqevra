import { IQuery } from '@nestjs/cqrs';

export class FetchDomainInfosQuery implements IQuery {
  constructor(
    public readonly accessToken: string,
    public readonly params: {
      pageSize: number;
      page: number;
      sortProperty: string;
      sortOrder: string;
    },
  ) {}
}
