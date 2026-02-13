import useSWR from "swr";
const { NotificationService } = require("@/lib/services/thingsboardServices/notificationService");
import type { NotificationTemplate } from "@/lib/types/dashboardTypes";

interface UseNotificationTemplatesOptions {
    page?: number;
    pageSize?: number;
    sortProperty?: string;
    sortOrder?: string;
}

export function useNotificationTemplates({
    page = 0,
    pageSize = 10,
    sortProperty = "createdTime",
    sortOrder = "DESC",
}: UseNotificationTemplatesOptions = {}) {
    // Generate a unique key for SWR based on the options
    const key = [
        "notificationTemplates",
        page,
        pageSize,
        sortProperty,
        sortOrder,
    ];

    const fetcher = async () => {
        return await NotificationService.getNotificationTemplates({
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
        templates: (data?.templates as NotificationTemplate[]) || [],
        totalPages: data?.totalPages || 0,
        totalElements: data?.totalElements || 0,
        isLoading,
        isError: error,
        mutate,
    };
}
