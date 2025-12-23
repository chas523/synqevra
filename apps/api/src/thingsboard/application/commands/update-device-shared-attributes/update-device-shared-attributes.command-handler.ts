import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateDeviceSharedAttributesCommand } from './update-device-shared-attributes.command';
import { Inject } from '@nestjs/common';
import { Result, Ok, Err } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';

@CommandHandler(UpdateDeviceSharedAttributesCommand)
export class UpdateDeviceSharedAttributesCommandHandler
  implements
    ICommandHandler<
      UpdateDeviceSharedAttributesCommand,
      Result<void, ThingsboardApiException>
    >
{
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApiPort: ThingsboardApiPort,
  ) {}

  async execute(
    command: UpdateDeviceSharedAttributesCommand,
  ): Promise<Result<void, ThingsboardApiException>> {
    const { accessToken, id, attributes } = command;

    try {
      await this.thingsboardApiPort.updateDeviceSharedAttributes(
        accessToken,
        id,
        attributes,
      );

      return Ok(undefined);
    } catch (error) {
      return Err(
        ThingsboardApiException.createException(
          'Failed to update device shared attributes',
          error,
        ),
      );
    }
  }
}
