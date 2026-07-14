import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { UpdateMailSettingsCommand } from './update-mail-settings.command';
import { MailSettingsDto } from 'src/thingsboard/interface/rest/dtos/response/mail-settings.response.dto';

@CommandHandler(UpdateMailSettingsCommand)
export class UpdateMailSettingsCommandHandler implements ICommandHandler<
  UpdateMailSettingsCommand,
  Result<MailSettingsDto, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    command: UpdateMailSettingsCommand,
  ): Promise<Result<MailSettingsDto, ThingsboardApiException>> {
    try {
      const settings = await this.thingsboardApi.updateMailSettings(
        command.accessToken,
        command.settings,
      );

      return Ok(settings);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
