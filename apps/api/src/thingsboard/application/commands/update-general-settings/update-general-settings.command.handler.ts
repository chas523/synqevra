import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { UpdateGeneralSettingsCommand } from './update-general-settings.command';
import { GeneralSettingsDto } from 'src/thingsboard/interface/rest/dtos/response/general-settings.response.dto';
import { ConfigService } from '@nestjs/config';

@CommandHandler(UpdateGeneralSettingsCommand)
export class UpdateGeneralSettingsCommandHandler
    implements
    ICommandHandler<
        UpdateGeneralSettingsCommand,
        Result<GeneralSettingsDto, ThingsboardApiException>
    > {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
    ) { }

    async execute(
        command: UpdateGeneralSettingsCommand,
    ): Promise<Result<GeneralSettingsDto, ThingsboardApiException>> {
        try {
            const settings = await this.thingsboardApi.updateGeneralSettings(
                command.accessToken,
                command.settings,
            );

            return Ok(settings);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
