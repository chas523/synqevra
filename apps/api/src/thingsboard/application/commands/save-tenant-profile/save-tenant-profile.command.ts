export class SaveTenantProfileCommand {
    constructor(public readonly tenantProfile: any, public readonly accessToken: string) { }
}
