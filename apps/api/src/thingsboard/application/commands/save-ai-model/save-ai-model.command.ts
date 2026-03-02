import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

export class SaveAiModelCommand extends Command<Result<any, ThingsboardApiException>> {
    constructor(
        public readonly accessToken: string,
        public readonly payload: any,
    ) {
        super();
    }
}
