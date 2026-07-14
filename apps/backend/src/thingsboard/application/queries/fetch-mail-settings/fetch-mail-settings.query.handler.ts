import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { FetchMailSettingsQuery } from './fetch-mail-settings.query';
import { MailSettingsDto } from 'src/thingsboard/interface/rest/dtos/response/mail-settings.response.dto';

@QueryHandler(FetchMailSettingsQuery)
export class FetchMailSettingsQueryHandler implements IQueryHandler<
  FetchMailSettingsQuery,
  Result<MailSettingsDto, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) {}

  async execute(
    query: FetchMailSettingsQuery,
  ): Promise<Result<MailSettingsDto, ThingsboardApiException>> {
    try {
      const settings = await this.thingsboardApi.fetchMailSettings(
        query.accessToken,
      );

      return Ok(settings);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
