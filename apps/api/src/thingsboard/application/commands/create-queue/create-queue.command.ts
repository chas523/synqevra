import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { QueueDto } from 'src/thingsboard/interface/rest/dtos/response/queue.response.dto';

export class CreateQueueCommand extends Command<
    Result<QueueDto, ThingsboardApiException>
> {
    constructor(
        public readonly queue: QueueDto,
        public readonly accessToken: string,
    ) {
        super();
    }
}
