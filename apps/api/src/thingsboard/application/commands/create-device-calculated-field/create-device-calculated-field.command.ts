import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import {
  CreateCalculatedFieldPayload,
  DeviceCalculatedField,
} from '../../ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

export class CreateDeviceCalculatedFieldCommand extends Command<
  Result<DeviceCalculatedField, ThingsboardApiException>
> {
  constructor(
    public readonly accessToken: string,
    public readonly payload: CreateCalculatedFieldPayload,
  ) {
    super();
  }
}
