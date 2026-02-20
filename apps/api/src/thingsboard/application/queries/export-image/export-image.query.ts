import { IQuery } from '@nestjs/cqrs';

export class ExportImageQuery implements IQuery {
    constructor(
        public readonly imageLink: string,
        public readonly accessToken: string,
    ) { }
}
