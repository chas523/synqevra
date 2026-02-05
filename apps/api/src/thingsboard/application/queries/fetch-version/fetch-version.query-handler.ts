import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { FetchVersionQuery } from './fetch-version.query';
import { DashboardVersionResponse } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-version.response.dto';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { Err, Ok, Result } from 'oxide.ts';
import { InjectRepository } from '@nestjs/typeorm';
import {
  THINGSBOARD_API_PORT,
  ThingsboardApiPort,
} from '../../ports/thingsboard.api.port';
import { ThingsboardApiAdapter } from 'src/thingsboard/infrastructure/http/thingsboard.api.adapter';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@QueryHandler(FetchVersionQuery)
export class FetchVersionQueryHandler implements IQueryHandler<
  FetchVersionQuery,
  Result<DashboardVersionResponse, ThingsboardApiException>
> {
  constructor(
    @Inject(THINGSBOARD_API_PORT)
    public readonly thingsboardApiRepository: ThingsboardApiPort,
    private readonly configService: ConfigService,
  ) {}

  private get THINGSBOARD_SYSADMIN_EMAIL(): string {
    return this.configService.getOrThrow<string>('THINGSBOARD_SYSADMIN_EMAIL');
  }

  private get THINGSBOARD_SYSADMIN_PASSWORD(): string {
    return this.configService.getOrThrow<string>(
      'THINGSBOARD_SYSADMIN_PASSWORD',
    );
  }

  async execute(
    _: FetchVersionQuery,
  ): Promise<Result<DashboardVersionResponse, ThingsboardApiException>> {
    try {
      const loginResponse =
        await this.thingsboardApiRepository.loginToSysadminAccount(
          this.THINGSBOARD_SYSADMIN_EMAIL,
          this.THINGSBOARD_SYSADMIN_PASSWORD,
        );

      const version = await this.thingsboardApiRepository.fetchDashboardVersion(
        loginResponse.token,
      );
      return Ok(version);
    } catch (e) {
      return Err(e as ThingsboardApiException);
    }
  }
}
