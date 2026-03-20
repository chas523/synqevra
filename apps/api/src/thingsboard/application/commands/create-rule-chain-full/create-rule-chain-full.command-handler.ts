import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { Result, Ok, Err } from 'oxide.ts';
import { ThingsboardApiPort, THINGSBOARD_API_PORT } from '../../ports/thingsboard.api.port';
import { CreateRuleChainFullCommand } from './create-rule-chain-full.command';
import { ThingsboardApiException } from '../../../infrastructure/http/thingsboard.http.errors';

@CommandHandler(CreateRuleChainFullCommand)
export class CreateRuleChainFullCommandHandler implements ICommandHandler<CreateRuleChainFullCommand> {
  private readonly logger = new Logger(CreateRuleChainFullCommandHandler.name);

  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(command: CreateRuleChainFullCommand): Promise<Result<any, ThingsboardApiException>> {
    try {
      const response = await this.thingsboardApi.createRuleChainFull(
        command.accessToken,
        command.payload,
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
