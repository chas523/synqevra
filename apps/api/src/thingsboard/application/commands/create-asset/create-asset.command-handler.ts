import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Err, Ok, Result } from 'oxide.ts';
import {
  Asset,
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { CreateAssetCommand, CreateAssetErrors } from './create-asset.command';

@CommandHandler(CreateAssetCommand)
export class CreateAssetCommandHandler
  implements ICommandHandler<CreateAssetCommand, Result<Asset, CreateAssetErrors>>
{
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    command: CreateAssetCommand,
  ): Promise<Result<Asset, CreateAssetErrors>> {
    try {
      const created = await this.thingsboardApi.createAsset(
        command.accessToken,
        command.payload,
      );

      return Ok(created);
    } catch (error) {
      return Err(error as CreateAssetErrors);
    }
  }
}
