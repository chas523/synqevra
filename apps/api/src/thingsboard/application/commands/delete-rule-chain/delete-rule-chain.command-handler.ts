import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { Result, Ok, Err } from 'oxide.ts';
import { ThingsboardApiPort, THINGSBOARD_API_PORT } from '../../ports/thingsboard.api.port';
import { DeleteRuleChainCommand } from './delete-rule-chain.command';
import { ThingsboardApiException } from '../../../infrastructure/http/thingsboard.http.errors';

@CommandHandler(DeleteRuleChainCommand)
export class DeleteRuleChainCommandHandler implements ICommandHandler<DeleteRuleChainCommand> {
  private readonly logger = new Logger(DeleteRuleChainCommandHandler.name);

  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(command: DeleteRuleChainCommand): Promise<Result<void, ThingsboardApiException>> {
    try {
      await this.thingsboardApi.deleteRuleChain(
        command.accessToken,
        command.ruleChainId,
      );
      return Ok(undefined);
    } catch (error) {
      if (error instanceof ThingsboardApiException) {
        return Err(error);
      }
      return Err(new ThingsboardApiException(String(error), 500));
    }
  }
}
