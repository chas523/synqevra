import useSWR from "swr";
import type {
  TenantsRequestOptions,
  PaginatedResponse,
  DeviceData,
} from "@/lib/types/dashboardTypes";
import { TenantService } from "@/lib/services/adminServices/tenantService";

interface UseTenantDevicesResult {
  data: PaginatedResponse<DeviceData> | undefined;
  error: Error | undefined;
  isLoading: boolean;
  mutate: () => void;
}

const DEFAULT_OPTIONS: TenantsRequestOptions = {
  sortBy: "createdTime",
  sortOrder: "desc",
  limit: 20,
};

export function useTenantDevices(
  tenantId: string,
  options: TenantsRequestOptions = DEFAULT_OPTIONS,
): UseTenantDevicesResult {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  const swrKey = ["tenantDevices", tenantId, JSON.stringify(mergedOptions)];

  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    () => TenantService.getTenantDevices(tenantId, mergedOptions),
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
