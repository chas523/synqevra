import { Command } from '@nestjs/cqrs';
import { Result } from 'node_modules/oxide.ts/dist/result';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

//TODO: Add medplum service device deletion
export class DeleteDeviceCommand extends Command<
  Result<void, ThingsboardApiException>
> {
  public readonly accessToken: string;
  public readonly id: string;

  constructor(accessToken: string, id: string) {
    super();
    this.accessToken = accessToken;
    this.id = id;
  }
}
