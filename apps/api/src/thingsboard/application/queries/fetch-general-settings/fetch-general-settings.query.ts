import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';

import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { GeneralSettingsDto } from 'src/thingsboard/interface/rest/dtos/response/general-settings.response.dto';

export class FetchGeneralSettingsQuery extends Query<
    Result<GeneralSettingsDto, ThingsboardApiException>
> {
    constructor() {
        super();
    }
}
