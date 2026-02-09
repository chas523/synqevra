import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SaveTenantProfileCommand } from './save-tenant-profile.command';
import { Err, Ok, Result } from 'oxide.ts';
import { Logger, Inject } from '@nestjs/common';
import { SysAdminAuthService } from '../../services/sysadmin-auth.service';
import { TBAdminGetError } from '../../../domain/errors/thingsboard-admin.errors';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
    TenantProfile,
} from '../../ports/thingsboard.api.port';

@CommandHandler(SaveTenantProfileCommand)
export class SaveTenantProfileCommandHandler
    implements
    ICommandHandler<
        SaveTenantProfileCommand,
        Result<any, TBAdminGetError>
    > {
    private readonly logger = new Logger(SaveTenantProfileCommandHandler.name);

    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
        private readonly sysAdminAuth: SysAdminAuthService,
    ) { }

    async execute(
        command: SaveTenantProfileCommand,
    ): Promise<Result<TenantProfile, TBAdminGetError>> {
        try {
            this.logger.debug(
                `Saving tenant profile: ${command.tenantProfile.id.id}`,
            );

            // Get sys admin access token
            const accessToken = await this.sysAdminAuth.getAccessToken();

            // Save the tenant profile
            const savedProfile = await this.thingsboardApi.saveTenantProfile(
                accessToken,
                command.tenantProfile,
            );

            this.logger.log(
                `Successfully saved tenant profile: ${savedProfile.id.id}`,
            );

            return Ok(savedProfile);
        } catch (error) {
            this.logger.error('Failed to save tenant profile', error);
            return Err(new TBAdminGetError());
        }
    }
}
