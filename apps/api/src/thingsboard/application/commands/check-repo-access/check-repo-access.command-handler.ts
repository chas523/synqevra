import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { CheckRepoAccessCommand } from './check-repo-access.command';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@CommandHandler(CheckRepoAccessCommand)
export class CheckRepoAccessCommandHandler implements ICommandHandler<
    CheckRepoAccessCommand,
    Result<any, ThingsboardApiException>
> {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
    ) { }

    async execute(
        command: CheckRepoAccessCommand,
    ): Promise<Result<any, ThingsboardApiException>> {
        try {
            const response = await this.thingsboardApi.checkRepoAccess(
                command.accessToken,
                command.payload,
            );
            return Ok(response);
        } catch (error) {
            return Err(
                ThingsboardApiException.createException(
                    'Failed to check repository access',
                    error,
                ),
            );
        }
    }
}
