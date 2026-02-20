import { IQuery } from '@nestjs/cqrs';

export class DownloadWidgetTypeQuery implements IQuery {
    constructor(
        public readonly widgetTypeId: string,
        public readonly accessToken: string,
        public readonly includeResources: boolean = false
    ) { }
}
