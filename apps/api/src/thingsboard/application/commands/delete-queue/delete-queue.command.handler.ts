import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { DeleteQueueCommand } from './delete-queue.command';
import { ConfigService } from '@nestjs/config';

@CommandHandler(DeleteQueueCommand)
export class DeleteQueueCommandHandler implements ICommandHandler<
  DeleteQueueCommand,
  Result<void, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    command: DeleteQueueCommand,
  ): Promise<Result<void, ThingsboardApiException>> {
    try {
      await this.thingsboardApi.deleteQueue(
        command.accessToken,
        command.queueId,
      );

      return Ok(undefined);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
