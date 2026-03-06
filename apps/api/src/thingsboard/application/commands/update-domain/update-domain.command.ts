import { ICommand } from '@nestjs/cqrs';

export class UpdateDomainCommand implements ICommand {
    constructor(
        public readonly accessToken: string,
        public readonly domainId: string,
        public readonly payload: { name: string; oauth2Enabled: boolean; propagateToEdge: boolean; },
        public readonly oauth2ClientIds: string[],
    ) { }
}
