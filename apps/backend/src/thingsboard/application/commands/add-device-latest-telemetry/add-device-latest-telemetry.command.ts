import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

export class AddDeviceLatestTelemetryCommand extends Command<
  Result<void, ThingsboardApiException>
> {
  public readonly accessToken: string;
  public readonly id: string;
  public readonly telemetry: Record<string, unknown>;

  constructor(
    accessToken: string,
    id: string,
    telemetry: Record<string, unknown>,
  ) {
    super();
    this.accessToken = accessToken;
    this.id = id;
    this.telemetry = telemetry;
  }
}
