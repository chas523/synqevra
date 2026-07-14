import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { SaveTrendzSettingsCommand } from './save-trendz-settings.command';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@CommandHandler(SaveTrendzSettingsCommand)
export class SaveTrendzSettingsCommandHandler implements ICommandHandler<
  SaveTrendzSettingsCommand,
  Result<any, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    command: SaveTrendzSettingsCommand,
  ): Promise<Result<any, ThingsboardApiException>> {
    const { accessToken, payload } = command;
    try {
      const response = await this.thingsboardApi.saveTrendzSettings(
        accessToken,
        payload,
      );
      return Ok(response);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
