import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { DeleteAiModelCommand } from './delete-ai-model.command';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@CommandHandler(DeleteAiModelCommand)
export class DeleteAiModelCommandHandler implements ICommandHandler<
  DeleteAiModelCommand,
  Result<any, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    command: DeleteAiModelCommand,
  ): Promise<Result<any, ThingsboardApiException>> {
    const { accessToken, modelId } = command;
    try {
      const response = await this.thingsboardApi.deleteAiModel(
        accessToken,
        modelId,
      );
      return Ok(response);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
