import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { UpdateConnectivitySettingsCommand } from './update-connectivity-settings.command';
import { ConnectivitySettingsDto } from 'src/thingsboard/interface/rest/dtos/response/connectivity-settings.response.dto';
import { ConfigService } from '@nestjs/config';

@CommandHandler(UpdateConnectivitySettingsCommand)
export class UpdateConnectivitySettingsCommandHandler
    implements
    ICommandHandler<
        UpdateConnectivitySettingsCommand,
        Result<ConnectivitySettingsDto, ThingsboardApiException>
    > {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
    ) { }

    async execute(
        command: UpdateConnectivitySettingsCommand,
    ): Promise<Result<ConnectivitySettingsDto, ThingsboardApiException>> {
        try {
            const settings = await this.thingsboardApi.updateConnectivitySettings(
                command.accessToken,
                command.settings,
            );

            return Ok(settings);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
