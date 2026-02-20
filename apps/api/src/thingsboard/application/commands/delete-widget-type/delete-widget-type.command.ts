import { ICommand } from '@nestjs/cqrs';

export class DeleteWidgetTypeCommand implements ICommand {
    constructor(
        public readonly widgetTypeId: string,
        public readonly accessToken: string,
    ) { }
}
