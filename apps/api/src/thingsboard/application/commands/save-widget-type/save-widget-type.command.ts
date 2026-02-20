import { ICommand } from '@nestjs/cqrs';

export class SaveWidgetTypeCommand implements ICommand {
    constructor(
        public readonly widgetType: any,
        public readonly accessToken: string,
        public readonly updateExistingByFqn: boolean = false
    ) { }
}
