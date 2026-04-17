import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import { DeleteEntityAttributesCommand } from './delete-entity-attributes.command';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@CommandHandler(DeleteEntityAttributesCommand)
export class DeleteEntityAttributesCommandHandler implements ICommandHandler<
  DeleteEntityAttributesCommand,
  Result<void, ThingsboardApiException>
> {
  private readonly logger = new Logger(DeleteEntityAttributesCommandHandler.name);

  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    command: DeleteEntityAttributesCommand,
  ): Promise<Result<void, ThingsboardApiException>> {
    const { accessToken, entityType, entityId, scope, keys } = command;

    try {
      this.logger.log(`Deleting attributes for ${entityType}/${entityId} [${scope}]: ${keys}`);
      
      // We need to implement deleteEntityAttributes in Port/Adapter if not exists
      // For now, I'll use a dynamic call to a new method we'll add to the adapter
      await (this.thingsboardApi as any).deleteEntityAttributes(
        accessToken,
        entityType,
        entityId,
        scope,
        keys,
      );
      
      return Ok(undefined);
    } catch (error) {
      this.logger.error('Error deleting entity attributes', error);
      return Err(error as ThingsboardApiException);
    }
  }
}
