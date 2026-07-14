import { Command } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { CreateNotificationTemplateRequestDto } from 'src/thingsboard/interface/rest/dtos/request/create-notification-template.request.dto';
import { NotificationTemplateDto } from 'src/thingsboard/interface/rest/dtos/response/notification-template.response.dto';

export class CreateNotificationTemplateCommand extends Command<
  Result<NotificationTemplateDto, ThingsboardApiException>
> {
  constructor(
    public readonly accessToken: string,
    public readonly templateData: CreateNotificationTemplateRequestDto,
  ) {
    super();
  }
}
