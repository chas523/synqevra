import { Query } from '@nestjs/cqrs';

export class FetchTwoFaSettingsQuery {
    constructor(public readonly accessToken: string) { }
}
