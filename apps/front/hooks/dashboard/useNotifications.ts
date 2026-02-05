import useSWR from "swr";
import type {
    NotificationsRequestOptions,
    PaginatedResponse,
    Notification,
} from "@/lib/types/dashboardTypes";
import { NotificationService } from "@/lib/services/adminServices/notificationService";

interface UseNotificationsResult {
    data: PaginatedResponse<Notification> | undefined;
    error: Error | undefined;
    isLoading: boolean;
    mutate: () => void;
}

const DEFAULT_OPTIONS: NotificationsRequestOptions = {
    sortBy: "createdTime",
    sortOrder: "desc",
    limit: 20,
};

export function useNotifications(
    options: NotificationsRequestOptions = DEFAULT_OPTIONS,
): UseNotificationsResult {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    const swrKey = ["notifications", JSON.stringify(mergedOptions)];

    const { data, error, isLoading, mutate } = useSWR(
        swrKey,
        () => NotificationService.getNotifications(mergedOptions),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
        },
    );

    return {
        data,
        error,
        isLoading,
        mutate,
    };
}
