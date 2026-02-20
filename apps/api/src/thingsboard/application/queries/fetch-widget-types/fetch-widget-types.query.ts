import { IQuery } from '@nestjs/cqrs';

export class FetchWidgetTypesQuery implements IQuery {
    constructor(
        public readonly page: number,
        public readonly pageSize: number,
        public readonly sortProperty: string,
        public readonly sortOrder: 'ASC' | 'DESC',
        public readonly tenantOnly: boolean,
        public readonly fullSearch: boolean,
        public readonly scadaFirst: boolean,
        public readonly deprecatedFilter: string,
        public readonly widgetsBundleId: string = '',
        public readonly accessToken: string,
    ) { }
}
