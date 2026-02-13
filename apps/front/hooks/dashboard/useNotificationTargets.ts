import useSWR from "swr";
const { NotificationService } = require("@/lib/services/thingsboardServices/notificationService");
import type { NotificationTarget } from "@/lib/types/dashboardTypes";

interface UseNotificationTargetsOptions {
    page?: number;
    pageSize?: number;
    sortProperty?: string;
    sortOrder?: string;
}

export function useNotificationTargets({
    page = 0,
    pageSize = 10,
    sortProperty = "createdTime",
    sortOrder = "DESC",
}: UseNotificationTargetsOptions = {}) {
    // Generate a unique key for SWR based on the options
    const key = [
        "notificationTargets",
        page,
        pageSize,
        sortProperty,
        sortOrder,
    ];

    const fetcher = async () => {
        return await NotificationService.getNotificationTargets({
            page,
            pageSize,
            sortProperty,
            sortOrder,
        });
    };

    const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
        keepPreviousData: true,
        revalidateOnFocus: false,
    });

    return {
        targets: (data?.targets as NotificationTarget[]) || [],
        totalPages: data?.totalPages || 0,
        totalElements: data?.totalElements || 0,
        isLoading,
        isError: error,
        mutate,
    };
}
