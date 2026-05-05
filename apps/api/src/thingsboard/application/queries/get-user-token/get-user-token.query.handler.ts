import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserTokenQuery } from './get-user-token.query';
import { ThingsboardLoginResponse } from '../../ports/thingsboard.api.port';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';

@QueryHandler(GetUserTokenQuery)
export class GetUserTokenQueryHandler
  implements IQueryHandler<GetUserTokenQuery>
{
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApiPort: ThingsboardApiPort,
  ) {}

  async execute(query: GetUserTokenQuery): Promise<ThingsboardLoginResponse> {
    return await this.thingsboardApiPort.getUserToken(
      query.sysAdminAccessToken,
      query.userId,
    );
  }
}
