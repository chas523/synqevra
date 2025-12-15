import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import {
  MedplumApiError,
  ThingsboardApiException,
} from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { CreateDeviceRequest } from 'src/thingsboard/interface/rest/dtos/request/thingsboard-device.request.dto';
import { Device } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-created-device.response.dto';

export type CreateDeviceErrors = MedplumApiError | ThingsboardApiException;

export type CreateDeviceProps = {
  accessToken: string;
  payload: CreateDeviceRequest;
  userId: number;
};
export class CreateDeviceCommand extends Command<
  Result<Device, CreateDeviceErrors>
> {
  public readonly accessToken: string;
  public readonly payload: CreateDeviceRequest;
  public readonly userId: number;

  constructor(dto: CreateDeviceProps) {
    super();
    this.accessToken = dto.accessToken;
    this.payload = dto.payload;
    this.userId = dto.userId;
  }
}
