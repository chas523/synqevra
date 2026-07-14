import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { NotificationTargetDto } from 'src/thingsboard/interface/rest/dtos/response/notification-target.response.dto';
import { CreateNotificationTargetRequestDto } from 'src/thingsboard/interface/rest/dtos/request/create-notification-target.request.dto';

export class CreateNotificationTargetCommand extends Command<
  Result<NotificationTargetDto, ThingsboardApiException>
> {
  constructor(
    public readonly accessToken: string,
    public readonly request: CreateNotificationTargetRequestDto,
  ) {
    super();
  }
}
