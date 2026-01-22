import useSWR from "swr";
import type {
  TenantsRequestOptions,
  PaginatedResponse,
  Tenant,
} from "@/lib/types/dashboardTypes";
import { TenantService } from "@/lib/services/adminServices/tenantService";

interface UseTenantsResult {
  data: PaginatedResponse<Tenant> | undefined;
  error: Error | undefined;
  isLoading: boolean;
  mutate: () => void;
}

const DEFAULT_OPTIONS: TenantsRequestOptions = {
  sortBy: "createdTime",
  sortOrder: "desc",
  limit: 20,
};

export function useTenants(
  options: TenantsRequestOptions = DEFAULT_OPTIONS,
): UseTenantsResult {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  const swrKey = ["tenants", JSON.stringify(mergedOptions)];

  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    () => TenantService.getTenants(mergedOptions),
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
