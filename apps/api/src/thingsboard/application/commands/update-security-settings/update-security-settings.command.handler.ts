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
    private readonly configService: ConfigService,
  ) {}

  private get THINGSBOARD_SYSADMIN_EMAIL(): string {
    return this.configService.getOrThrow<string>('THINGSBOARD_SYSADMIN_EMAIL');
  }

  private get THINGSBOARD_SYSADMIN_PASSWORD(): string {
    return this.configService.getOrThrow<string>(
      'THINGSBOARD_SYSADMIN_PASSWORD',
    );
  }

  async execute(
    command: UpdateSecuritySettingsCommand,
  ): Promise<Result<SecuritySettingsDto, ThingsboardApiException>> {
    const { settings } = command;
    const settingsObject = {
      ...settings,
      passwordPolicy: {
        ...settings.passwordPolicy,
        allowWhitespaces: false,
        forceUserToResetPasswordIfNotValid: false,
      },
    };
    try {
      const loginResponse = await this.thingsboardApi.loginToSysadminAccount(
        this.THINGSBOARD_SYSADMIN_EMAIL,
        this.THINGSBOARD_SYSADMIN_PASSWORD,
      );

      const updatedSettings = await this.thingsboardApi.updateSecuritySettings(
        loginResponse.token,
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
