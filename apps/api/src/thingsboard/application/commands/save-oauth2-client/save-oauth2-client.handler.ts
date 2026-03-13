import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Ok, Err, Result } from 'oxide.ts';
import { SaveOAuth2ClientCommand } from './save-oauth2-client.command';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

@CommandHandler(SaveOAuth2ClientCommand)
export class SaveOAuth2ClientCommandHandler implements ICommandHandler<
  SaveOAuth2ClientCommand,
  Result<any, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    command: SaveOAuth2ClientCommand,
  ): Promise<Result<any, ThingsboardApiException>> {
    try {
      const data = await this.thingsboardApi.saveOAuth2Client(
        command.accessToken,
        command.payload,
      );
      return Ok(data);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
