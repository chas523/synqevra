export class FetchTenantProfileAlarmsQuery {
    constructor(
        public readonly tenantProfileId: string,
        public readonly page: number = 0,
        public readonly pageSize: number = 10,
        public readonly statusList?: string[],
        public readonly severityList?: string[],
        public readonly startTime?: number,
        public readonly endTime?: number,
        public readonly accessToken?: string,
    ) { }
}
