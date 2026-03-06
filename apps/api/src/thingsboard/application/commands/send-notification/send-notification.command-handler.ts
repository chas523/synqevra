import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { SendNotificationCommand } from './send-notification.command';
import { NotificationRequestResponse } from 'src/thingsboard/interface/rest/dtos/response/notification-request.response.dto';

@CommandHandler(SendNotificationCommand)
export class SendNotificationCommandHandler implements ICommandHandler<
  SendNotificationCommand,
  Result<NotificationRequestResponse, ThingsboardApiException>
> {
  private readonly logger = new Logger(SendNotificationCommandHandler.name);

  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    command: SendNotificationCommand,
  ): Promise<Result<NotificationRequestResponse, ThingsboardApiException>> {
    try {
      const result = await this.thingsboardApi.sendNotification(
        command.accessToken,
        command.notificationRequest,
      );

      return Ok(result);
    } catch (error) {
      this.logger.error('Error sending notification', error);
      return Err(error as ThingsboardApiException);
    }
  }
}
