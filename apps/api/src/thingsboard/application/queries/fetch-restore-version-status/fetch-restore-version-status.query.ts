import { IQuery } from '@nestjs/cqrs';

export class FetchRestoreVersionStatusQuery implements IQuery {
    constructor(
        public readonly accessToken: string,
        public readonly requestId: string,
    ) { }
}
