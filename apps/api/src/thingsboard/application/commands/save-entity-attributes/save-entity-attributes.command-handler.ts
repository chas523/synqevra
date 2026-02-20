import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SaveEntityAttributesCommand } from './save-entity-attributes.command';
import { Err, Ok, Result } from 'oxide.ts';
import { Logger, Inject } from '@nestjs/common';

import { TBAdminGetError } from '../../../domain/errors/thingsboard-admin.errors';
import {
    THINGSBOARD_API_PORT,
    ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';

@CommandHandler(SaveEntityAttributesCommand)
export class SaveEntityAttributesCommandHandler
    implements
    ICommandHandler<SaveEntityAttributesCommand, Result<void, TBAdminGetError>> {
    private readonly logger = new Logger(SaveEntityAttributesCommandHandler.name);

    constructor(
        @Inject(THINGSBOARD_API_PORT)
        private readonly thingsboardApi: ThingsboardApiPort,
    ) { }

    async execute(
        command: SaveEntityAttributesCommand,
    ): Promise<Result<void, TBAdminGetError>> {
        const { entityType, entityId, scope, attributes, accessToken } = command;

        try {
            this.logger.log(`Saving attributes for ${entityType}/${entityId}`);

            await this.thingsboardApi.saveEntityAttributes(
                accessToken,
                entityType,
                entityId,
                scope,
                attributes,
            );

            this.logger.log(`Successfully saved attributes for ${entityType}/${entityId}`);
            return Ok(undefined);
        } catch (error) {
            this.logger.error('Error saving entity attributes', error);
            return Err(new TBAdminGetError());
        }
    }
}
