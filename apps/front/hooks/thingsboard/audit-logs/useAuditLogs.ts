import useSWR from "swr";
import { AuditLogsService, AuditLogParams } from "@/lib/services/thingsboardServices/auditLogsService";

export function useAuditLogs(params: AuditLogParams, page: number, pageSize: number, sortProperty: string, sortOrder: "ASC" | "DESC") {
    const key = `audit-logs-${params.startTime}-${params.endTime}-${page}-${pageSize}-${sortProperty}-${sortOrder}`;

    const { data, isLoading, error, mutate } = useSWR(
        key,
        () => AuditLogsService.getAuditLogs({ ...params, page, pageSize, sortProperty, sortOrder }),
        { revalidateOnFocus: false }
    );

    return {
        logs: data?.data ?? [],
        totalPages: data?.totalPages ?? 0,
        totalElements: data?.totalElements ?? 0,
        isLoading,
        error,
        mutate,
    };
}
