import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateTenantCommand } from './update-tenant.command';
import { Err, Ok, Result } from 'oxide.ts';
import { Logger, Inject } from '@nestjs/common';
import { TenantResponse } from '../../ports/thingsboard.api.port';
import { SysAdminAuthService } from '../../services/sysadmin-auth.service';
import { TBAdminGetError } from '../../../domain/errors/thingsboard-admin.errors';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';

@CommandHandler(UpdateTenantCommand)
export class UpdateTenantCommandHandler
    implements
    ICommandHandler<
        UpdateTenantCommand,
        Result<TenantResponse, TBAdminGetError>
    > {
    private readonly logger = new Logger(UpdateTenantCommandHandler.name);

    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
        private readonly sysAdminAuth: SysAdminAuthService,
    ) { }

    async execute(
        command: UpdateTenantCommand,
    ): Promise<Result<TenantResponse, TBAdminGetError>> {
        const { tenantData } = command;

        try {
            this.logger.log(`Updating tenant: ${tenantData.id.id}`);
            const accessToken = await this.sysAdminAuth.getAccessToken();

            const response = await this.thingsboardApi.updateTenant(
                tenantData,
                accessToken,
            );

            this.logger.log(`Successfully updated tenant: ${tenantData.id.id}`);
            return Ok(response);
        } catch (error) {
            this.logger.error('Error updating tenant', error);
            return Err(new TBAdminGetError());
        }
    }
}
