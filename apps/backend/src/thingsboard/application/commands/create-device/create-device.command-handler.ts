import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import {
  CreateDeviceCommand,
  CreateDeviceErrors,
} from './create-device.command';
import { Device } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-created-device.response.dto';

@CommandHandler(CreateDeviceCommand)
export class CreateDeviceCommandHandler implements ICommandHandler<
  CreateDeviceCommand,
  Result<Device, CreateDeviceErrors>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    command: CreateDeviceCommand,
  ): Promise<Result<Device, CreateDeviceErrors>> {
    try {
      const { accessToken, payload, userId } = command;

      const newDevice: Device = await this.thingsboardApi.createDevice(
        accessToken,
        payload,
        userId,
      );

      return Ok(newDevice);
    } catch (error) {
      return Err(error as CreateDeviceErrors);
    }
  }
}
