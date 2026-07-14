import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

export class DeleteResourceCommand extends Command<
  Result<void, ThingsboardApiException>
> {
  constructor(
    public readonly resourceId: string,
    public readonly accessToken: string,
    public readonly force: boolean = false,
  ) {
    super();
  }
}
