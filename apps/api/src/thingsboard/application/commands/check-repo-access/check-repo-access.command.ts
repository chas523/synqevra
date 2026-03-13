import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

export class CheckRepoAccessCommand extends Command<
  Result<any, ThingsboardApiException>
> {
  public readonly accessToken: string;
  public readonly payload: any;

  constructor(accessToken: string, payload: any) {
    super();
    this.accessToken = accessToken;
    this.payload = payload;
  }
}
