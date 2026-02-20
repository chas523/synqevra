import { IQuery } from '@nestjs/cqrs';

export class FetchWidgetTypeByIdQuery implements IQuery {
    constructor(
        public readonly widgetTypeId: string,
        public readonly accessToken: string,
    ) { }
}
