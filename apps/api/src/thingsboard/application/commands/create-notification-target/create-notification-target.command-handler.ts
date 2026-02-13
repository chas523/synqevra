import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
    ThingsboardApiPort,
    THINGSBOARD_API_PORT,
} from '../../../application/ports/thingsboard.api.port';
import { CreateNotificationTargetCommand } from './create-notification-target.command';
import { NotificationTargetDto } from 'src/thingsboard/interface/rest/dtos/response/notification-target.response.dto';
import { SysAdminAuthService } from '../../services/sysadmin-auth.service';

@CommandHandler(CreateNotificationTargetCommand)
export class CreateNotificationTargetCommandHandler
    implements
    ICommandHandler<
        CreateNotificationTargetCommand,
        Result<NotificationTargetDto, ThingsboardApiException>
    > {
    private readonly logger = new Logger(
        CreateNotificationTargetCommandHandler.name,
    );

    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApiPort: ThingsboardApiPort,
        private readonly sysAdminAuthService: SysAdminAuthService,
    ) { }

    async execute(
        command: CreateNotificationTargetCommand,
    ): Promise<Result<NotificationTargetDto, ThingsboardApiException>> {
        try {
            // Get SysAdmin token
            const sysAdminToken = await this.sysAdminAuthService.getAccessToken();

            // Create notification target
            const target = await this.thingsboardApiPort.createNotificationTarget(
                sysAdminToken,
                command.request,
            );

            this.logger.log(
                `Successfully created notification target: ${target.name} (ID: ${target.id.id})`,
            );
            return Ok(target);
        } catch (error) {
            this.logger.error(
                `Failed to create notification target: ${error.message}`,
            );
            return Err(
                error instanceof ThingsboardApiException
                    ? error
                    : new ThingsboardApiException(error.message, 500),
            );
        }
    }
}
