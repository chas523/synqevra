import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import { DeleteRelationCommand } from './delete-relation.command';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';

import { TBAdminGetError } from '../../../domain/errors/thingsboard-admin.errors';

@CommandHandler(DeleteRelationCommand)
export class DeleteRelationCommandHandler implements ICommandHandler<
  DeleteRelationCommand,
  Result<void, TBAdminGetError>
> {
  private readonly logger = new Logger(DeleteRelationCommandHandler.name);

  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    command: DeleteRelationCommand,
  ): Promise<Result<void, TBAdminGetError>> {
    const { fromId, fromType, relationType, toId, toType, accessToken } =
      command;

    try {
      await this.thingsboardApi.deleteRelation(
        accessToken,
        fromId,
        fromType,
        relationType,
        toId,
        toType,
      );

      return Ok(undefined);
    } catch (error) {
      this.logger.error('Error deleting relation', error);
      return Err(new TBAdminGetError());
    }
  }
}
