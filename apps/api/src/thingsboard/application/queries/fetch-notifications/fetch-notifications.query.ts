import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { TBAdminGetNotificationsError } from '../../../domain/errors/thingsboard-admin.errors';
import { GetNotificationsResponse } from '../../../interface/rest/dtos/response/thingsboard-get-notifications.response.dto';

export type FetchNotificationsProps = {
  page?: number;
  pageSize?: number;
};

export class FetchNotificationsQuery extends Query<
  Result<GetNotificationsResponse, TBAdminGetNotificationsError>
> {
  public readonly page: number;
  public readonly pageSize: number;
  public readonly accessToken: string;

  constructor(props: FetchNotificationsProps, accessToken: string) {
    super();
    this.page = props.page ?? 0;
    this.pageSize = props.pageSize ?? 10;
    this.accessToken = accessToken;
  }
}
