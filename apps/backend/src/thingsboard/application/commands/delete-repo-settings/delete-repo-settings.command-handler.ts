import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { DeleteRepoSettingsCommand } from './delete-repo-settings.command';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@CommandHandler(DeleteRepoSettingsCommand)
export class DeleteRepoSettingsCommandHandler implements ICommandHandler<
  DeleteRepoSettingsCommand,
  Result<any, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    command: DeleteRepoSettingsCommand,
  ): Promise<Result<any, ThingsboardApiException>> {
    const { accessToken } = command;
    try {
      const response =
        await this.thingsboardApi.deleteRepoSettings(accessToken);
      return Ok(response);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
