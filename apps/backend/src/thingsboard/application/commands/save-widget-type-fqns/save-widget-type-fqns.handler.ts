import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SaveWidgetTypeFqnsCommand } from './save-widget-type-fqns.command';
import { Inject } from '@nestjs/common';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { Result, Ok, Err } from 'oxide.ts';
import { ThingsboardApiException } from '../../../infrastructure/http/thingsboard.http.errors';
import { Logger } from '@nestjs/common';

@CommandHandler(SaveWidgetTypeFqnsCommand)
export class SaveWidgetTypeFqnsHandler implements ICommandHandler<SaveWidgetTypeFqnsCommand> {
  private readonly logger = new Logger(SaveWidgetTypeFqnsHandler.name);

  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    command: SaveWidgetTypeFqnsCommand,
  ): Promise<Result<any, ThingsboardApiException>> {
    const { accessToken, widgetsBundleId, fqns } = command;

    try {
      const result = await this.thingsboardApi.saveWidgetTypeFqns(
        accessToken,
        widgetsBundleId,
        fqns,
      );
      return Ok(result);
    } catch (error) {
      this.logger.error(`Failed to save widget type FQNs: ${error}`);
      return Err(error as ThingsboardApiException);
    }
  }
}
