import useSWR from "swr";
import { DeviceService } from "@/lib/services/thingsboardServices/deviceService";
import type { DevicesResponse } from "@/types/thingsboardDeviceTypes";

export function useDevices(page = 0, pageSize = 10) {
  const { data, error, isLoading, mutate } = useSWR<DevicesResponse>(
    `devices-${page}-${pageSize}`,
    () => DeviceService.fetchDevices(page, pageSize),
  );

  return {
    devices: data?.data || [],
    totalPages: data?.totalPages || 0,
    totalElements: data?.totalElements || 0,
    hasNext: data?.hasNext || false,
    error,
    isLoading,
    refresh: mutate,
  };
}
