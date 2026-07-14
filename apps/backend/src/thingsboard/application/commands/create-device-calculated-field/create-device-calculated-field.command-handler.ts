import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result, Ok, Err } from 'oxide.ts';
import {
  DeviceCalculatedField,
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { CreateDeviceCalculatedFieldCommand } from './create-device-calculated-field.command';

@CommandHandler(CreateDeviceCalculatedFieldCommand)
export class CreateDeviceCalculatedFieldCommandHandler implements ICommandHandler<
  CreateDeviceCalculatedFieldCommand,
  Result<DeviceCalculatedField, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApiPort: ThingsboardApiPort,
  ) {}

  async execute(
    command: CreateDeviceCalculatedFieldCommand,
  ): Promise<Result<DeviceCalculatedField, ThingsboardApiException>> {
    try {
      const createdCalculatedField =
        await this.thingsboardApiPort.createCalculatedField(
          command.accessToken,
          command.payload,
        );

      return Ok(createdCalculatedField);
    } catch (error) {
      return Err(
        ThingsboardApiException.createException(
          'Failed to create calculated field',
          error,
        ),
      );
    }
  }
}
