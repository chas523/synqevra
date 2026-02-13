import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { CreateNotificationRuleCommand } from './create-notification-rule.command';
import { THINGSBOARD_API_PORT, ThingsboardApiPort } from '../../ports/thingsboard.api.port';
import { NotificationRuleDto } from '../../../interface/rest/dtos/response/notification-rule.response.dto';
import { SysAdminAuthService } from '../../services/sysadmin-auth.service';
import { Result, Ok, Err } from 'oxide.ts';
import { ThingsboardApiException } from '../../../infrastructure/http/thingsboard.http.errors';

@CommandHandler(CreateNotificationRuleCommand)
export class CreateNotificationRuleCommandHandler
    implements ICommandHandler<CreateNotificationRuleCommand> {
    private readonly logger = new Logger(CreateNotificationRuleCommandHandler.name);

    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApiPort: ThingsboardApiPort,
        private readonly sysAdminAuthService: SysAdminAuthService,
    ) { }

    async execute(
        command: CreateNotificationRuleCommand,
    ): Promise<Result<NotificationRuleDto, ThingsboardApiException>> {
        try {
            const sysAdminToken = await this.sysAdminAuthService.getAccessToken();
            const rule = await this.thingsboardApiPort.saveNotificationRule(
                sysAdminToken,
                command.rule,
            );
            this.logger.log(`Created notification rule: ${rule.name}`);
            return Ok(rule);
        } catch (error) {
            this.logger.error(
                `Failed to create notification rule: ${error.message}`,
            );
            return Err(
                error instanceof ThingsboardApiException
                    ? error
                    : new ThingsboardApiException(error.message, 500),
            );
        }
    }
}
