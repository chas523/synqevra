import { IQuery } from '@nestjs/cqrs';

export class FetchMailSettingsQuery implements IQuery {
  constructor(public readonly accessToken: string) {}
}
