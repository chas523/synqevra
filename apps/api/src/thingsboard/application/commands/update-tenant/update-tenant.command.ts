import { UpdateTenantDto } from '../../ports/thingsboard.api.port';

export class UpdateTenantCommand {
    constructor(public readonly tenantData: UpdateTenantDto, public readonly accessToken: string) { }
}
