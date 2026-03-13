import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { SaveRepoSettingsCommand } from './save-repo-settings.command';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@CommandHandler(SaveRepoSettingsCommand)
export class SaveRepoSettingsCommandHandler implements ICommandHandler<
  SaveRepoSettingsCommand,
  Result<any, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    command: SaveRepoSettingsCommand,
  ): Promise<Result<any, ThingsboardApiException>> {
    try {
      const response = await this.thingsboardApi.saveRepoSettings(
        command.accessToken,
        command.payload,
      );
      return Ok(response);
    } catch (error) {
      return Err(
        ThingsboardApiException.createException(
          'Failed to save repository settings',
          error,
        ),
      );
    }
  }
}
