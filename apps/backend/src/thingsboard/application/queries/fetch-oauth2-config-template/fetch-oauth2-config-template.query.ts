import { IQuery } from '@nestjs/cqrs';

export class FetchOAuth2ConfigTemplateQuery implements IQuery {
  constructor(public readonly accessToken: string) {}
}
