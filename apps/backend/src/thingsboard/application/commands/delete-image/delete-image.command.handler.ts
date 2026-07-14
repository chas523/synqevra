import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { DeleteImageCommand } from './delete-image.command';
import { DeleteImageResponseDto } from 'src/thingsboard/interface/rest/dtos/response/image.response.dto';
import { ConfigService } from '@nestjs/config';

@CommandHandler(DeleteImageCommand)
export class DeleteImageCommandHandler implements ICommandHandler<
  DeleteImageCommand,
  Result<DeleteImageResponseDto, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    command: DeleteImageCommand,
  ): Promise<Result<DeleteImageResponseDto, ThingsboardApiException>> {
    try {
      const { imageLink, force, accessToken } = command;

      const response = await this.thingsboardApi.deleteImage(
        accessToken,
        imageLink,
        force,
      );

      return Ok(response);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
