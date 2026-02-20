import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { DeleteResourceCommand } from './delete-resource.command';
import { ConfigService } from '@nestjs/config';

@CommandHandler(DeleteResourceCommand)
export class DeleteResourceCommandHandler
    implements
    ICommandHandler<
        DeleteResourceCommand,
        Result<void, ThingsboardApiException>
    > {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
    ) { }

    async execute(
        command: DeleteResourceCommand,
    ): Promise<Result<void, ThingsboardApiException>> {
        try {
            await this.thingsboardApi.deleteResource(
                command.accessToken,
                command.resourceId,
                command.force,
            );

            return Ok(undefined);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
