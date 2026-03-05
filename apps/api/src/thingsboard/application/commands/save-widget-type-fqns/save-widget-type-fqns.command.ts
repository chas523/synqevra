export class SaveWidgetTypeFqnsCommand {
  constructor(
    public readonly accessToken: string,
    public readonly widgetsBundleId: string,
    public readonly fqns: string[],
  ) {}
}
