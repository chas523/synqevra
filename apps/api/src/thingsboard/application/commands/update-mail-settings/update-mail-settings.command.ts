import { MailSettingsDto } from "src/thingsboard/interface/rest/dtos/response/mail-settings.response.dto";

export class UpdateMailSettingsCommand {
    constructor(public readonly settings: MailSettingsDto) { }
}
