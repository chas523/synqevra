export class FetchTenantEventsQuery {
    constructor(
        public readonly tenantId: string,
        public readonly page: number = 0,
        public readonly pageSize: number = 10,
        public readonly eventType?: string,
        public readonly startTime?: number,
        public readonly endTime?: number,
        public readonly accessToken?: string,
    ) { }
}
