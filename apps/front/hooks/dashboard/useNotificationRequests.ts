import useSWR from "swr";
import { NotificationService } from "@/lib/services/thingsboardServices/notificationService";
import type { NotificationRequest, NotificationRequestsOptions } from "@/lib/types/dashboardTypes";

interface NotificationRequestsResponse {
    data: NotificationRequest[];
    totalPages: number;
    totalElements: number;
    hasNext: boolean;
}

export const useNotificationRequests = (options: NotificationRequestsOptions) => {
    const { data, error, isLoading, mutate } = useSWR(
        ["notificationRequests", JSON.stringify(options)],
        () => NotificationService.getNotificationRequests(options)
    );

    return {
        requests: (data?.data || []) as NotificationRequest[],
        totalPages: data?.totalPages || 0,
        totalElements: data?.totalElements || 0,
        hasNext: data?.hasNext || false,
        error,
        isLoading,
        mutate,
    };
};
