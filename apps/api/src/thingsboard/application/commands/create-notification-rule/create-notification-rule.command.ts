import { CreateNotificationRuleRequestDto } from '../../../interface/rest/dtos/request/create-notification-rule.request.dto';

export class CreateNotificationRuleCommand {
    constructor(
        public readonly rule: CreateNotificationRuleRequestDto,
        public readonly accessToken: string,
    ) { }
}
