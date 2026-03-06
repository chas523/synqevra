import { proxyApi } from "@/lib/api/api";

export interface AuditLogParams {
    pageSize?: number;
    page?: number;
    sortProperty?: string;
    sortOrder?: string;
    startTime: number;
    endTime: number;
}

export class AuditLogsService {
    public static async getAuditLogs(params: AuditLogParams): Promise<any> {
        const {
            pageSize = 10,
            page = 0,
            sortProperty = "createdTime",
            sortOrder = "DESC",
            startTime,
            endTime,
        } = params;
        const url = `thingsboard/audit/logs?pageSize=${pageSize}&page=${page}&sortProperty=${sortProperty}&sortOrder=${sortOrder}&startTime=${startTime}&endTime=${endTime}`;
        const { data } = await proxyApi.get(url);
        return data;
    }
}
