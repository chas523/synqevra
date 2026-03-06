export class FetchWidgetsBundlesQuery {
  constructor(
    public readonly accessToken: string,
    public readonly page: number,
    public readonly pageSize: number,
    public readonly sortProperty: string,
    public readonly sortOrder: 'ASC' | 'DESC',
    public readonly tenantOnly: boolean,
    public readonly fullSearch: boolean,
    public readonly scadaFirst: boolean,
    public readonly deprecatedFilter: string,
  ) {}
}
