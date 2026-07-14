import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { GeneralSettingsDto } from 'src/thingsboard/interface/rest/dtos/response/general-settings.response.dto';

export class UpdateGeneralSettingsCommand extends Command<
  Result<GeneralSettingsDto, ThingsboardApiException>
> {
  constructor(
    public readonly settings: GeneralSettingsDto,
    public readonly accessToken: string,
  ) {
    super();
  }
}
