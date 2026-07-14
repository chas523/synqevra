import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { Result, Ok, Err } from 'oxide.ts';
import { SaveTwoFaSettingsCommand } from './save-2fa-settings.command';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from 'src/thingsboard/application/ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@CommandHandler(SaveTwoFaSettingsCommand)
export class SaveTwoFaSettingsCommandHandler implements ICommandHandler<SaveTwoFaSettingsCommand> {
  private readonly logger = new Logger(SaveTwoFaSettingsCommandHandler.name);

  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApiPort: ThingsboardApiPort,
  ) {}

  async execute(
    command: SaveTwoFaSettingsCommand,
  ): Promise<Result<void, ThingsboardApiException>> {
    try {
      await this.thingsboardApiPort.saveTwoFaSettings(
        command.accessToken,
        command.settings,
      );
      return Ok(undefined);
    } catch (error) {
      return Err(error);
    }
  }
}
