import { SaveWidgetBundleRequestDto } from 'src/thingsboard/interface/rest/dtos/request/save-widget-bundle.request.dto';

export class SaveWidgetBundleCommand {
    constructor(public readonly widgetBundle: SaveWidgetBundleRequestDto) { }
}
