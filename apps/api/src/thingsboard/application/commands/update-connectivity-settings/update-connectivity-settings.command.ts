import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { ConnectivitySettingsDto } from 'src/thingsboard/interface/rest/dtos/response/connectivity-settings.response.dto';

export class UpdateConnectivitySettingsCommand extends Command<
  Result<ConnectivitySettingsDto, ThingsboardApiException>
> {
  constructor(
    public readonly settings: ConnectivitySettingsDto,
    public readonly accessToken: string,
  ) {
    super();
  }
}
