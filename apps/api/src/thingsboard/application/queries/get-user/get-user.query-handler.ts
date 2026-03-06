import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Ok, Err, Result } from 'oxide.ts';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { GetUserQuery } from './get-user.query';
import {
  GetUserError,
  InvalidTokenError,
  ThingsboardConnectionError,
} from 'src/thingsboard/domain/errors/thingsboard.errors';
import { AxiosError } from 'axios';
import { ThingsboardUserResponseDto } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-user.response.dto';

@QueryHandler(GetUserQuery)
export class GetUserQueryHandler implements IQueryHandler<
  GetUserQuery,
  Result<ThingsboardUserResponseDto, GetUserError>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: GetUserQuery,
  ): Promise<Result<ThingsboardUserResponseDto, GetUserError>> {
    try {
      const userResponse = await this.thingsboardApi.getUser(query.accessToken);

      // Map infrastructure type to DTO
      const userDto: ThingsboardUserResponseDto = {
        id: userResponse.id,
        createdTime: userResponse.createdTime,
        tenantId: userResponse.tenantId,
        customerId: userResponse.customerId,
        email: userResponse.email,
        firstName: userResponse.firstName,
        lastName: userResponse.lastName,
        phone: userResponse.phone,
        authority: userResponse.authority,
        additionalInfo: userResponse.additionalInfo,
      };

      return Ok(userDto);
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        if (status === 401) {
          return Err(new InvalidTokenError());
        }
      }
      return Err(new ThingsboardConnectionError());
    }
  }
}
