import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { Result, Ok, Err } from 'oxide.ts';
import { ThingsboardApiPort, THINGSBOARD_API_PORT } from '../../ports/thingsboard.api.port';
import { SetRootRuleChainCommand } from './set-root-rule-chain.command';
import { ThingsboardApiException } from '../../../infrastructure/http/thingsboard.http.errors';

@CommandHandler(SetRootRuleChainCommand)
export class SetRootRuleChainCommandHandler implements ICommandHandler<SetRootRuleChainCommand> {
  private readonly logger = new Logger(SetRootRuleChainCommandHandler.name);

  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(command: SetRootRuleChainCommand): Promise<Result<any, ThingsboardApiException>> {
    try {
      const response = await this.thingsboardApi.setRootRuleChain(
        command.accessToken,
        command.ruleChainId,
      );
      return Ok(response);
    } catch (error) {
      if (error instanceof ThingsboardApiException) {
        return Err(error);
      }
      return Err(new ThingsboardApiException(String(error), 500));
    }
  }
}
