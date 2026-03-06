import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateNotificationTemplateCommand } from './create-notification-template.command';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { Inject, Logger } from '@nestjs/common';

import { Err, Ok, Result } from 'oxide.ts';
import { NotificationTemplateDto } from 'src/thingsboard/interface/rest/dtos/response/notification-template.response.dto';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@CommandHandler(CreateNotificationTemplateCommand)
export class CreateNotificationTemplateCommandHandler implements ICommandHandler<CreateNotificationTemplateCommand> {
  private readonly logger = new Logger(
    CreateNotificationTemplateCommandHandler.name,
  );

  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApiPort: ThingsboardApiPort,
  ) {}

  async execute(
    command: CreateNotificationTemplateCommand,
  ): Promise<Result<NotificationTemplateDto, ThingsboardApiException>> {
    try {
      const template = await this.thingsboardApiPort.createNotificationTemplate(
        command.accessToken,
        command.templateData,
      );
      this.logger.log(`Created notification template: ${template.name}`);
      return Ok(template);
    } catch (error) {
      this.logger.error(
        `Failed to create notification template: ${error.message}`,
      );
      return Err(
        error instanceof ThingsboardApiException
          ? error
          : new ThingsboardApiException(error.message, 500),
      );
    }
  }
}
