import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SaveWidgetBundleCommand } from './save-widget-bundle.command';
import { Inject, Logger } from '@nestjs/common';
import { THINGSBOARD_API_PORT, ThingsboardApiPort } from '../../ports/thingsboard.api.port';
import { ConfigService } from '@nestjs/config';
import { SysAdminAuthService } from 'src/thingsboard/application/services/sysadmin-auth.service';

@CommandHandler(SaveWidgetBundleCommand)
export class SaveWidgetBundleCommandHandler
    implements ICommandHandler<SaveWidgetBundleCommand> {
    private readonly logger = new Logger(SaveWidgetBundleCommandHandler.name);

    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
        private readonly configService: ConfigService,
        private readonly sysAdminAuthService: SysAdminAuthService,
    ) { }

    async execute(command: SaveWidgetBundleCommand): Promise<any> {
        const { widgetBundle } = command;
        const token = await this.sysAdminAuthService.getAccessToken();

        return this.thingsboardApi.saveWidgetBundle(token, widgetBundle);
    }
}
