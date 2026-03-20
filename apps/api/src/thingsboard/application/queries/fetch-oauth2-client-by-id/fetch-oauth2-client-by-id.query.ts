import { IQuery } from '@nestjs/cqrs';

export class FetchOAuth2ClientByIdQuery implements IQuery {
  constructor(
    public readonly accessToken: string,
    public readonly clientId: string,
  ) {}
}
