import useSWR from "swr";
import { UserService } from "../../lib/services/userService";
import type {
  PaginatedResponse,
  PendingUser,
  RequestedAccessUsersRequestOptions,
} from "../../lib/types/dashboardTypes";

interface UseRequestedUsersResult {
  data: PaginatedResponse<PendingUser> | undefined;
  error: Error | undefined;
  isLoading: boolean;
  mutate: () => void;
}

const DEFAULT_OPTIONS: RequestedAccessUsersRequestOptions = {
  sortBy: "createdAt",
  sortOrder: "desc",
  limit: 10,
};

export function useRequestedUsers(
  options: RequestedAccessUsersRequestOptions = DEFAULT_OPTIONS,
): UseRequestedUsersResult {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  const swrKey = ["requestedUsers", JSON.stringify(mergedOptions)];
  console.log(swrKey);
  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    () => UserService.getUsersThatRequestedAccess(mergedOptions),
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
