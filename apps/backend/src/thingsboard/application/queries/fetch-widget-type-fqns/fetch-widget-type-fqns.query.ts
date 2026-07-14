export class FetchWidgetTypeFqnsQuery {
  constructor(
    public readonly accessToken: string,
    public readonly widgetsBundleId: string,
  ) {}
}
