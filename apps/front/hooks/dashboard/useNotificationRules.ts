import useSWR from "swr";
const {
  NotificationService,
} = require("@/lib/services/thingsboardServices/notificationService");
import type { NotificationRule } from "@/lib/types/dashboardTypes";

interface UseNotificationRulesOptions {
  page?: number;
  pageSize?: number;
  sortProperty?: string;
  sortOrder?: string;
}

export function useNotificationRules({
  page = 0,
  pageSize = 10,
  sortProperty = "createdTime",
  sortOrder = "DESC",
}: UseNotificationRulesOptions = {}) {
  // Generate a unique key for SWR based on the options
  const key = ["notificationRules", page, pageSize, sortProperty, sortOrder];

  const fetcher = async () => {
    return await NotificationService.getNotificationRules({
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
    rules: (data?.data as NotificationRule[]) || [], // Note: API returns { data: [], ... } for rules unlike others sometimes
    totalPages: data?.totalPages || 0,
    totalElements: data?.totalElements || 0,
    isLoading,
    isError: error,
    mutate,
  };
}
