export class FetchTenantProfileAttributesQuery {
  constructor(
    public readonly tenantProfileId: string,
    public readonly scope:
      | 'SERVER_SCOPE'
      | 'CLIENT_SCOPE'
      | 'SHARED_SCOPE' = 'SERVER_SCOPE',
    public readonly accessToken?: string,
  ) {}
}
