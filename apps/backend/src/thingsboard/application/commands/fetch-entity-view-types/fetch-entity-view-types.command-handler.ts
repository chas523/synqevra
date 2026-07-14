import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import {
  EntityViewTypeInfo,
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import {
  FetchEntityViewTypesCommand,
  FetchEntityViewTypesErrors,
} from './fetch-entity-view-types.command';

@CommandHandler(FetchEntityViewTypesCommand)
export class FetchEntityViewTypesCommandHandler implements ICommandHandler<
  FetchEntityViewTypesCommand,
  Result<EntityViewTypeInfo[], FetchEntityViewTypesErrors>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    command: FetchEntityViewTypesCommand,
  ): Promise<Result<EntityViewTypeInfo[], FetchEntityViewTypesErrors>> {
    try {
      const response = await this.thingsboardApi.fetchEntityViewTypes(
        command.accessToken,
      );

      return Ok(response);
    } catch (error) {
      return Err(error as FetchEntityViewTypesErrors);
    }
  }
}
