import { IQuery } from '@nestjs/cqrs';

export class DownloadImageQuery implements IQuery {
  constructor(
    public readonly imageLink: string,
    public readonly accessToken: string,
  ) {}
}
