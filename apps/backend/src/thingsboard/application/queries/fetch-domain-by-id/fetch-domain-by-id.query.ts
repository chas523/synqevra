import { IQuery } from '@nestjs/cqrs';

export class FetchDomainByIdQuery implements IQuery {
  constructor(
    public readonly accessToken: string,
    public readonly domainId: string,
  ) {}
}
