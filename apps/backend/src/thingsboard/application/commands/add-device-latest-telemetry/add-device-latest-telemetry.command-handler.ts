import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddDeviceLatestTelemetryCommand } from './add-device-latest-telemetry.command';
import { Inject } from '@nestjs/common';
import { Result, Ok, Err } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';

@CommandHandler(AddDeviceLatestTelemetryCommand)
export class AddDeviceLatestTelemetryCommandHandler implements ICommandHandler<
  AddDeviceLatestTelemetryCommand,
  Result<void, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApiPort: ThingsboardApiPort,
  ) {}

  async execute(
    command: AddDeviceLatestTelemetryCommand,
  ): Promise<Result<void, ThingsboardApiException>> {
    const { accessToken, id, telemetry } = command;

    try {
      await this.thingsboardApiPort.addDeviceLatestTelemetry(
        accessToken,
        id,
        telemetry,
      );

      return Ok(undefined);
    } catch (error) {
      return Err(
        ThingsboardApiException.createException(
          'Failed to add device latest telemetry',
          error,
        ),
      );
    }
  }
}
