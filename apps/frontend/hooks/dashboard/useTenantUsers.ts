import useSWR from "swr";
import type {
  PaginatedResponse,
  TenantsRequestOptions,
  TenantUser,
} from "@/lib/types/dashboardTypes";
import { TenantService } from "@/lib/services/adminServices/tenantService";

interface UseTenantUsersResult {
  data: PaginatedResponse<TenantUser> | undefined;
  error: Error | undefined;
  isLoading: boolean;
  mutate: () => void;
}

const DEFAULT_OPTIONS: TenantsRequestOptions = {
  sortBy: "createdTime",
  sortOrder: "desc",
  limit: 20,
};

export function useTenantUsers(
  tenantId: string,
  options: TenantsRequestOptions = DEFAULT_OPTIONS,
): UseTenantUsersResult {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  const swrKey = ["tenantUsers", tenantId, JSON.stringify(mergedOptions)];

  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    () => TenantService.getTenantUsers(tenantId, mergedOptions),
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
