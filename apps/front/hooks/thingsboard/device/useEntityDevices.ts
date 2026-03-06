"use client";

import useSWR from "swr";
import { DeviceService, DevicesResponse } from "@/lib/services/thingsboardServices/deviceService";

export const useEntityDevices = (
  page: number = 0,
  pageSize: number = 10,
  sortProperty: string = "createdTime",
  sortOrder: "ASC" | "DESC" = "DESC"
) => {
  const { data, error, isLoading, mutate } = useSWR<DevicesResponse>(
    ["entityDevices", page, pageSize, sortProperty, sortOrder],
    () => DeviceService.fetchDevices(page, pageSize, sortProperty, sortOrder),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    devices: data?.data ?? [],
    totalPages: data?.totalPages ?? 0,
    totalElements: data?.totalElements ?? 0,
    hasNext: data?.hasNext ?? false,
    isLoading,
    error,
    mutate,
  };
};
