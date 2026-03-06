import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { UpdateNotificationSettingsCommand } from './update-notification-settings.command';
import { NotificationSettingsDto } from 'src/thingsboard/interface/rest/dtos/response/notification-settings.response.dto';
import { ConfigService } from '@nestjs/config';

@CommandHandler(UpdateNotificationSettingsCommand)
export class UpdateNotificationSettingsCommandHandler implements ICommandHandler<
  UpdateNotificationSettingsCommand,
  Result<NotificationSettingsDto, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    command: UpdateNotificationSettingsCommand,
  ): Promise<Result<NotificationSettingsDto, ThingsboardApiException>> {
    try {
      const settings = await this.thingsboardApi.updateNotificationSettings(
        command.accessToken,
        command.settings,
      );

      return Ok(settings);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
