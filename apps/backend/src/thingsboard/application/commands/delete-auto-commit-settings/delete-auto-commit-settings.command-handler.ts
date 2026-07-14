import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { DeleteAutoCommitSettingsCommand } from './delete-auto-commit-settings.command';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@CommandHandler(DeleteAutoCommitSettingsCommand)
export class DeleteAutoCommitSettingsCommandHandler implements ICommandHandler<
  DeleteAutoCommitSettingsCommand,
  Result<any, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    command: DeleteAutoCommitSettingsCommand,
  ): Promise<Result<any, ThingsboardApiException>> {
    const { accessToken } = command;
    try {
      const response =
        await this.thingsboardApi.deleteAutoCommitSettings(accessToken);
      return Ok(response);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
