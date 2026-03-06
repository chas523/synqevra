import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import { THINGSBOARD_API_PORT, ThingsboardApiPort } from '../../ports/thingsboard.api.port';
import { SaveAutoCommitSettingsCommand } from './save-auto-commit-settings.command';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@CommandHandler(SaveAutoCommitSettingsCommand)
export class SaveAutoCommitSettingsCommandHandler implements ICommandHandler<SaveAutoCommitSettingsCommand, Result<any, ThingsboardApiException>> {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
    ) { }

    async execute(command: SaveAutoCommitSettingsCommand): Promise<Result<any, ThingsboardApiException>> {
        const { accessToken, payload } = command;
        try {
            const response = await this.thingsboardApi.saveAutoCommitSettings(accessToken, payload);
            return Ok(response);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
