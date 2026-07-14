import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

export class DeleteRepoSettingsCommand extends Command<
  Result<any, ThingsboardApiException>
> {
  constructor(public readonly accessToken: string) {
    super();
  }
}
