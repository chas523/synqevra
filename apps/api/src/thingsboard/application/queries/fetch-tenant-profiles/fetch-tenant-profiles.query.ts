export class FetchTenantProfilesQuery {
    constructor(
        public readonly page: number,
        public readonly pageSize: number,
        public readonly sortProperty?: string,
        public readonly sortOrder?: string,
        public readonly textSearch?: string,
    ) { }
}
