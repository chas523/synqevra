import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateRelationCommand } from './create-relation.command';
import { Err, Ok, Result } from 'oxide.ts';
import { Logger, Inject } from '@nestjs/common';
import { SysAdminAuthService } from '../../services/sysadmin-auth.service';
import { TBAdminGetError } from '../../../domain/errors/thingsboard-admin.errors';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';

@CommandHandler(CreateRelationCommand)
export class CreateRelationCommandHandler
    implements ICommandHandler<CreateRelationCommand, Result<void, TBAdminGetError>> {
    private readonly logger = new Logger(CreateRelationCommandHandler.name);

    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
        private readonly sysAdminAuth: SysAdminAuthService,
    ) { }

    async execute(
        command: CreateRelationCommand,
    ): Promise<Result<void, TBAdminGetError>> {
        const { fromId, fromType, toId, toType, relationType, additionalInfo } = command;

        try {
            const accessToken = await this.sysAdminAuth.getAccessToken();

            await this.thingsboardApi.saveRelation(
                accessToken,
                {
                    from: { id: fromId, entityType: fromType },
                    to: { id: toId, entityType: toType },
                    type: relationType,
                    typeGroup: 'COMMON',
                    additionalInfo,
                }
            );

            return Ok(undefined);
        } catch (error) {
            this.logger.error('Error creating relation', error);
            return Err(new TBAdminGetError());
        }
    }
}
