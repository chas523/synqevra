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
import { ThingsboardLoginCommand } from './thingsboard-login.command';
import {
  LoginError,
  InvalidCredentialsError,
  ThingsboardConnectionError,
} from 'src/thingsboard/domain/errors/thingsboard.errors';
import { AxiosError } from 'axios';
import { ThingsboardTokensResponseDto } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-tokens.response.dto';

@CommandHandler(ThingsboardLoginCommand)
export class ThingsboardLoginCommandHandler implements ICommandHandler<
  ThingsboardLoginCommand,
  Result<ThingsboardTokensResponseDto, LoginError>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
    @Inject(THINGSBOARD_REPOSITORY_PORT)
    private readonly thingsboardRepository: ThingsboardRepositoryPort,
  ) {}

  async execute(
    command: ThingsboardLoginCommand,
  ): Promise<Result<ThingsboardTokensResponseDto, LoginError>> {
    try {
      const { userId, username, password } = command;

      const loginResponse = await this.thingsboardApi.login(
        userId,
        username,
        password,
      );

      // Find ThingsBoard connection for user
      const thingsboardModel =
        await this.thingsboardRepository.findByUserId(userId);

      if (thingsboardModel) {
        thingsboardModel.setAccessToken(loginResponse.token);
        thingsboardModel.setRefreshToken(loginResponse.refreshToken);
        await this.thingsboardRepository.update(thingsboardModel);
      }

      return Ok({
        accessToken: loginResponse.token,
        refreshToken: loginResponse.refreshToken,
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        if (status === 401) {
          return Err(new InvalidCredentialsError());
        }
      }
      return Err(new ThingsboardConnectionError());
    }
  }
}
