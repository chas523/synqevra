import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { OtaPackagesPageResponseDto } from 'src/thingsboard/interface/rest/dtos/response/ota-package.response.dto';

export type FetchOtaPackagesProps = {
    accessToken: string;
    page?: number;
    pageSize?: number;
    sortProperty?: string;
    sortOrder?: 'ASC' | 'DESC';
};

export class FetchOtaPackagesQuery extends Query<
    Result<OtaPackagesPageResponseDto, ThingsboardApiException>
> {
    public readonly accessToken: string;
    public readonly page: number;
    public readonly pageSize: number;
    public readonly sortProperty: string;
    public readonly sortOrder: 'ASC' | 'DESC';

    constructor(props: FetchOtaPackagesProps) {
        super();
        this.accessToken = props.accessToken;
        this.page = props.page ?? 0;
        this.pageSize = props.pageSize ?? 10;
        this.sortProperty = props.sortProperty ?? 'createdTime';
        this.sortOrder = props.sortOrder ?? 'DESC';
    }
}
