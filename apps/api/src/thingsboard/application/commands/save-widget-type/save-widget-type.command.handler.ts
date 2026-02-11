import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { SaveWidgetTypeCommand } from './save-widget-type.command';
import { WidgetTypeDto } from 'src/thingsboard/interface/rest/dtos/response/widget-types.response.dto';
import { ConfigService } from '@nestjs/config';

@CommandHandler(SaveWidgetTypeCommand)
export class SaveWidgetTypeCommandHandler
    implements ICommandHandler<SaveWidgetTypeCommand, Result<WidgetTypeDto, ThingsboardApiException>> {
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

    async execute(command: SaveWidgetTypeCommand): Promise<Result<WidgetTypeDto, ThingsboardApiException>> {
        try {
            const loginResponse = await this.thingsboardApi.loginToSysadminAccount(
                this.THINGSBOARD_SYSADMIN_EMAIL,
                this.THINGSBOARD_SYSADMIN_PASSWORD,
            );

            const widgetType = await this.thingsboardApi.saveWidgetType(
                loginResponse.token,
                command.widgetType,
                command.updateExistingByFqn
            );

            return Ok(widgetType);
        } catch (error) {
            return Err(error as ThingsboardApiException);
        }
    }
}
