import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { RefreshTokenError } from 'src/thingsboard/domain/errors/thingsboard.errors';
import { ThingsboardTokensResponseDto } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-tokens.response.dto';

export class RefreshTokenCommand extends Command<
  Result<ThingsboardTokensResponseDto, RefreshTokenError>
> {
  constructor(public readonly userId: number) {
    super();
  }
}
