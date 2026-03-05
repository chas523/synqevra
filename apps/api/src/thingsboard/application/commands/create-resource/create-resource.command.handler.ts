import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { CreateResourceCommand } from './create-resource.command';
import { ResourceDto } from 'src/thingsboard/interface/rest/dtos/response/resource.response.dto';
import { ConfigService } from '@nestjs/config';

@CommandHandler(CreateResourceCommand)
export class CreateResourceCommandHandler implements ICommandHandler<
  CreateResourceCommand,
  Result<ResourceDto, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    command: CreateResourceCommand,
  ): Promise<Result<ResourceDto, ThingsboardApiException>> {
    try {
      const result = await this.thingsboardApi.createResource(
        command.accessToken,
        command.resource,
      );

      return Ok(result);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
