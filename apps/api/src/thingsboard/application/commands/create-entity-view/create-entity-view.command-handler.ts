import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import {
  EntityView,
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import {
  CreateEntityViewCommand,
  CreateEntityViewErrors,
} from './create-entity-view.command';

@CommandHandler(CreateEntityViewCommand)
export class CreateEntityViewCommandHandler implements ICommandHandler<
  CreateEntityViewCommand,
  Result<EntityView, CreateEntityViewErrors>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    command: CreateEntityViewCommand,
  ): Promise<Result<EntityView, CreateEntityViewErrors>> {
    try {
      const created = await this.thingsboardApi.createEntityView(
        command.accessToken,
        command.payload,
      );

      return Ok(created);
    } catch (error) {
      return Err(error as CreateEntityViewErrors);
    }
  }
}
