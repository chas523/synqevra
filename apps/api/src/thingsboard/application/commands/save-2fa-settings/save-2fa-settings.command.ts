import { TwoFactorAuthSettingsRequestDto } from 'src/thingsboard/interface/rest/dtos/request/thingsboard-2fa-settings.request.dto';

export class SaveTwoFaSettingsCommand {
    constructor(
        public readonly sysAdminAccessToken: string,
        public readonly settings: TwoFactorAuthSettingsRequestDto,
    ) { }
}
