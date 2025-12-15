import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { GetUserError } from 'src/thingsboard/domain/errors/thingsboard.errors';
import { ThingsboardUserResponseDto } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-user.response.dto';

export class GetUserQuery extends Command<
  Result<ThingsboardUserResponseDto, GetUserError>
> {
  constructor(public readonly accessToken: string) {
    super();
  }
}
