import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

export class DeleteQueueCommand extends Command<
  Result<void, ThingsboardApiException>
> {
  constructor(
    public readonly queueId: string,
    public readonly accessToken: string,
  ) {
    super();
  }
}
