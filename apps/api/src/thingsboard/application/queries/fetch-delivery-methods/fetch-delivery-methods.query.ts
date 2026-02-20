import { Query } from '@nestjs/cqrs';
import { Result } from 'oxide.ts';
import { ThingsboardApiException } from 'src/thingsboard/infrastructure/http/thingsboard.http.errors';
import { DeliveryMethodsResponse } from 'src/thingsboard/interface/rest/dtos/response/delivery-methods.response.dto';

export class FetchDeliveryMethodsQuery extends Query<
    Result<DeliveryMethodsResponse, ThingsboardApiException>
> {
    constructor(public readonly accessToken: string) {
        super();
    }
}
