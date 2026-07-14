import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { DeleteWidgetTypeCommand } from './delete-widget-type.command';
import { ConfigService } from '@nestjs/config';

@CommandHandler(DeleteWidgetTypeCommand)
export class DeleteWidgetTypeCommandHandler implements ICommandHandler<
  DeleteWidgetTypeCommand,
  Result<void, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    command: DeleteWidgetTypeCommand,
  ): Promise<Result<void, ThingsboardApiException>> {
    try {
      await this.thingsboardApi.deleteWidgetType(
        command.accessToken,
        command.widgetTypeId,
      );

      return Ok(undefined);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
