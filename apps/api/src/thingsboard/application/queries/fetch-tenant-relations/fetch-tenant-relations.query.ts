export class FetchTenantRelationsQuery {
    constructor(
        public readonly tenantId: string,
        public readonly direction: 'FROM' | 'TO' = 'FROM',
        public readonly accessToken?: string,
    ) { }
}
