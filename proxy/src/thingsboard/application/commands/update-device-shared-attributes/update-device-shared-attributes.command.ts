import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

export class UpdateDeviceSharedAttributesCommand extends Command<
  Result<void, ThingsboardApiException>
> {
  public readonly accessToken: string;
  public readonly id: string;
  public readonly attributes: Record<string, any>;

  constructor(
    accessToken: string,
    id: string,
    attributes: Record<string, any>,
  ) {
    super();
    this.accessToken = accessToken;
    this.id = id;
    this.attributes = attributes;
  }
}
