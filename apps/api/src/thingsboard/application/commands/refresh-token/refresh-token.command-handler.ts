import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Ok, Err, Result } from 'oxide.ts';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import {
  THINGSBOARD_REPOSITORY_PORT,
  ThingsboardRepositoryPort,
} from '../../ports/thingsboard.repository.port';
import { RefreshTokenCommand } from './refresh-token.command';
import {
  RefreshTokenError,
  TokenRefreshError,
  ThingsboardConnectionNotFoundError,
  ExpiredTokenError,
} from 'src/thingsboard/domain/errors/thingsboard.errors';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { ThingsboardTokensResponseDto } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-tokens.response.dto';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenCommandHandler implements ICommandHandler<
  RefreshTokenCommand,
  Result<ThingsboardTokensResponseDto, RefreshTokenError>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
    @Inject(THINGSBOARD_REPOSITORY_PORT)
    private readonly thingsboardRepository: ThingsboardRepositoryPort,
  ) {}

  async execute(
    command: RefreshTokenCommand,
  ): Promise<Result<ThingsboardTokensResponseDto, RefreshTokenError>> {
    try {
      const { userId } = command;

      const thingsboardModel =
        await this.thingsboardRepository.findByUserId(userId);

      if (!thingsboardModel) {
        return Err(new ThingsboardConnectionNotFoundError());
      }

      const currentRefreshToken = thingsboardModel.getRefreshToken();
      if (!currentRefreshToken) {
        return Err(new TokenRefreshError());
      }

      const refreshResponse =
        await this.thingsboardApi.refreshToken(currentRefreshToken);

      thingsboardModel.setAccessToken(refreshResponse.token);
      thingsboardModel.setRefreshToken(refreshResponse.refreshToken);
      await this.thingsboardRepository.update(thingsboardModel);

      return Ok({
        accessToken: refreshResponse.token,
        refreshToken: refreshResponse.refreshToken,
      });
    } catch (error) {
      if (error instanceof ThingsboardApiException) {
        if (error.message.includes('Token has expired')) {
          return Err(new ExpiredTokenError());
        }
        return Err(new TokenRefreshError());
      }
      return Err(new TokenRefreshError());
    }
  }
}
