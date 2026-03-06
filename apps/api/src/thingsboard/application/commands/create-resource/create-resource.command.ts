import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
  ResourceDto,
  ResourceCreateDto,
} from 'src/thingsboard/interface/rest/dtos/response/resource.response.dto';

export class CreateResourceCommand extends Command<
  Result<ResourceDto, ThingsboardApiException>
> {
  constructor(
    public readonly resource: ResourceCreateDto,
    public readonly accessToken: string,
  ) {
    super();
  }
}
