import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { PreviewNotificationRequestCommand } from './preview-notification-request.command';
import { SysAdminAuthService } from '../../services/sysadmin-auth.service';

@CommandHandler(PreviewNotificationRequestCommand)
export class PreviewNotificationRequestCommandHandler
    implements
    ICommandHandler<
        PreviewNotificationRequestCommand,
        Result<any, ThingsboardApiException>
    > {
    private readonly logger = new Logger(PreviewNotificationRequestCommandHandler.name);

    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
        private readonly sysAdminAuthService: SysAdminAuthService,
    ) { }

    async execute(
        command: PreviewNotificationRequestCommand,
    ): Promise<Result<any, ThingsboardApiException>> {
        try {
            const sysAdminAccessToken =
                await this.sysAdminAuthService.getAccessToken();

            const result = await this.thingsboardApi.previewNotificationRequest(
                sysAdminAccessToken,
                command.previewRequest,
            );

            return Ok(result);
        } catch (error) {
            this.logger.error('Error previewing notification request', error);
            return Err(error as ThingsboardApiException);
        }
    }
}
