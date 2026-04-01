import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SaveRuleChainMetadataCommand } from './save-rule-chain-metadata.command';
import { ThingsboardApiPort, THINGSBOARD_API_PORT } from '../../ports/thingsboard.api.port';
import { Ok, Err } from 'oxide.ts';

@CommandHandler(SaveRuleChainMetadataCommand)
export class SaveRuleChainMetadataCommandHandler
  implements ICommandHandler<SaveRuleChainMetadataCommand>
{
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(command: SaveRuleChainMetadataCommand) {
    try {
      await this.thingsboardApi.updateRuleChainMetadata(
        command.ruleChainId,
        command.metadata,
        command.accessToken,
      );
      return Ok({ success: true });
    } catch (error) {
      return Err(error);
    }
  }
}
