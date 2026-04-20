import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { AssetsResponse } from 'src/thingsboard/application/ports/thingsboard.api.port';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';

export type FetchAssetsProps = {
  accessToken: string;
  page?: number;
  pageSize?: number;
  sortProperty?: string;
  sortOrder?: 'ASC' | 'DESC';
  assetProfileId?: string;
  assetIds?: string;
};

export class FetchAssetsQuery extends Query<
  Result<AssetsResponse, ThingsboardApiException>
> {
  public readonly accessToken: string;
  public readonly page: number;
  public readonly pageSize: number;
  public readonly sortProperty: string;
  public readonly sortOrder: 'ASC' | 'DESC';
  public readonly assetProfileId: string;
  public readonly assetIds: string | undefined;

  constructor(props: FetchAssetsProps) {
    super();
    this.accessToken = props.accessToken;
    this.page = props.page ?? 0;
    this.pageSize = props.pageSize ?? 10;
    this.sortProperty = props.sortProperty ?? 'createdTime';
    this.sortOrder = props.sortOrder ?? 'DESC';
    this.assetProfileId = props.assetProfileId ?? '';
    this.assetIds = props.assetIds;
  }
}
