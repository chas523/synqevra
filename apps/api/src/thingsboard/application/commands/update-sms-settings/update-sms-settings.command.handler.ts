import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { UpdateSmsSettingsCommand } from './update-sms-settings.command';
import { SmsSettingsDto } from 'src/thingsboard/interface/rest/dtos/response/sms-settings.response.dto';
import { ConfigService } from '@nestjs/config';

@CommandHandler(UpdateSmsSettingsCommand)
export class UpdateSmsSettingsCommandHandler
    implements
    ICommandHandler<
        UpdateSmsSettingsCommand,
        Result<SmsSettingsDto, ThingsboardApiException>
    > {
    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
        private readonly configService: ConfigService,
    ) { }

    private get THINGSBOARD_SYSADMIN_EMAIL(): string {
        return this.configService.getOrThrow<string>('THINGSBOARD_SYSADMIN_EMAIL');
    }

    private get THINGSBOARD_SYSADMIN_PASSWORD(): string {
        return this.configService.getOrThrow<string>(
            'THINGSBOARD_SYSADMIN_PASSWORD',
        );
    }

    async execute(
        command: UpdateSmsSettingsCommand,
    ): Promise<Result<SmsSettingsDto, ThingsboardApiException>> {
        try {
            const loginResponse = await this.thingsboardApi.loginToSysadminAccount(
                this.THINGSBOARD_SYSADMIN_EMAIL,
                this.THINGSBOARD_SYSADMIN_PASSWORD,
            );

            const settings = await this.thingsboardApi.updateSmsSettings(
                loginResponse.token,
                command.settings,
            );

            return Ok(settings);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
