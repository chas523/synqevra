import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';

import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { SecuritySettingsDto } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-security-settings.response.dto';

export class FetchSecuritySettingsQuery extends Query<
  Result<SecuritySettingsDto, ThingsboardApiException>
> {
  constructor(public readonly accessToken: string) {
    super();
  }
}
