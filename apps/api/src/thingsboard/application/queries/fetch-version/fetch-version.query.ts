import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { DashboardVersionResponse } from 'src/thingsboard/interface/rest/dtos/response/thingsboard-version.response.dto';

export class FetchVersionQuery extends Query<
  Result<DashboardVersionResponse, ThingsboardApiException>
> {}
