import { ICommand } from '@nestjs/cqrs';

export class RestoreVersionCommand implements ICommand {
    constructor(
        public readonly accessToken: string,
        public readonly payload: any,
    ) { }
}
