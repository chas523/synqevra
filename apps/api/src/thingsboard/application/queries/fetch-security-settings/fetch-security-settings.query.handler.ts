import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Err, Ok, Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { FetchSecuritySettingsQuery } from './fetch-security-settings.query';
import { SecuritySettingsDto } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-security-settings.response.dto';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';

@QueryHandler(FetchSecuritySettingsQuery)
export class FetchSecuritySettingsQueryHandler implements IQueryHandler<
  FetchSecuritySettingsQuery,
  Result<SecuritySettingsDto, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    private readonly thingsboardApi: ThingsboardApiPort,
  ) { }

  async execute(
    query: FetchSecuritySettingsQuery,
  ): Promise<Result<SecuritySettingsDto, ThingsboardApiException>> {
    try {
      const settings = await this.thingsboardApi.fetchSecuritySettings(
        query.accessToken,
      );

      const filteredSettings = plainToInstance(SecuritySettingsDto, settings, {
        excludeExtraneousValues: true,
      });

      return Ok(filteredSettings);
    } catch (error) {
      return Err(error as ThingsboardApiException);
    }
  }
}
