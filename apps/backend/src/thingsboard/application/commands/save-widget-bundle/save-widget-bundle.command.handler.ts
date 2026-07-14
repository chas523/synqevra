import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SaveWidgetBundleCommand } from './save-widget-bundle.command';
import { Inject, Logger } from '@nestjs/common';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';

@CommandHandler(SaveWidgetBundleCommand)
export class SaveWidgetBundleCommandHandler implements ICommandHandler<SaveWidgetBundleCommand> {
  private readonly logger = new Logger(SaveWidgetBundleCommandHandler.name);

  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(command: SaveWidgetBundleCommand): Promise<any> {
    const { widgetBundle, accessToken } = command;

    return this.thingsboardApi.saveWidgetBundle(accessToken, widgetBundle);
  }
}
