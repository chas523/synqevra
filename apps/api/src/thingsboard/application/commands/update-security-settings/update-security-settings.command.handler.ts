import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { UpdateSecuritySettingsCommand } from './update-security-settings.command';
import { SecuritySettingsDto } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-security-settings.response.dto';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { Err, Ok, Result } from 'oxide.ts';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { plainToInstance } from 'class-transformer';

@CommandHandler(UpdateSecuritySettingsCommand)
export class UpdateSecuritySettingsCommandHandler implements ICommandHandler<
  UpdateSecuritySettingsCommand,
  Result<SecuritySettingsDto, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) { }

  async execute(
    command: UpdateSecuritySettingsCommand,
  ): Promise<Result<SecuritySettingsDto, ThingsboardApiException>> {
    const { settings, accessToken } = command;
    const settingsObject = {
      ...settings,
      passwordPolicy: {
        ...settings.passwordPolicy,
        allowWhitespaces: false,
        forceUserToResetPasswordIfNotValid: false,
      },
    };
    try {
      const updatedSettings = await this.thingsboardApi.updateSecuritySettings(
        accessToken,
        settingsObject,
      );

      const filteredSettings = plainToInstance(
        SecuritySettingsDto,
        updatedSettings,
        {
          excludeExtraneousValues: true,
        },
      );

      return Ok(filteredSettings);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
