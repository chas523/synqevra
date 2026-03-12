import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RestoreVersionCommand } from './restore-version.command';
import { Inject, Logger } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../../application/ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@CommandHandler(RestoreVersionCommand)
export class RestoreVersionHandler implements ICommandHandler<
  RestoreVersionCommand,
  Result<string, ThingsboardApiException>
> {
  private readonly logger = new Logger(RestoreVersionHandler.name);

  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApiPort: ThingsboardApiPort,
  ) {}

  async execute(
    command: RestoreVersionCommand,
  ): Promise<Result<string, ThingsboardApiException>> {
    this.logger.debug(`Executing RestoreVersionCommand`);
    try {
      const response = await this.thingsboardApiPort.restoreVersion(
        command.accessToken,
        command.payload,
      );
      return Ok(response);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
