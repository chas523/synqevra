import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { LoginError } from 'src/thingsboard/domain/errors/thingsboard.errors';
import { ThingsboardTokensResponseDto } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-tokens.response.dto';

export class ThingsboardLoginCommand extends Command<
  Result<ThingsboardTokensResponseDto, LoginError>
> {
  constructor(
    public readonly userId: number,
    public readonly username: string,
    public readonly password: string,
  ) {
    super();
  }
}
