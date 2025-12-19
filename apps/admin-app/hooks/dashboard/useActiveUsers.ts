import useSWR from "swr";
import { UserService } from "../../lib/services/userService";
import type {
  ActiveUsersRequestOptions,
  PaginatedResponse,
  User,
} from "../../lib/types/dashboardTypes";

interface UseActiveUsersResult {
  data: PaginatedResponse<User> | undefined;
  error: Error | undefined;
  isLoading: boolean;
  mutate: () => void;
}

const DEFAULT_OPTIONS: ActiveUsersRequestOptions = {
  sortBy: "createdAt",
  sortOrder: "desc",
  limit: 10,
};

export function useActiveUsers(
  options: ActiveUsersRequestOptions = DEFAULT_OPTIONS,
): UseActiveUsersResult {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  const swrKey = ["activeUsers", JSON.stringify(mergedOptions)];

  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    () => UserService.getActiveUsers(mergedOptions),
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
