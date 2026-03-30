"use client";

import useSWR from "swr";
import {
  DeviceProfile,
  DeviceService,
  PagedThingsboardResponse,
} from "@/lib/services/thingsboardServices/deviceService";

export const useEntityDeviceProfiles = (
  page: number = 0,
  pageSize: number = 10,
  sortProperty: string = "createdTime",
  sortOrder: "ASC" | "DESC" = "DESC",
  textSearch?: string,
) => {
  const { data, error, isLoading, mutate } = useSWR<
    PagedThingsboardResponse<DeviceProfile>
  >(
    [
      "entityDeviceProfiles",
      page,
      pageSize,
      sortProperty,
      sortOrder,
      textSearch,
    ],
    () =>
      DeviceService.fetchDeviceProfiles(
        page,
        pageSize,
        sortProperty,
        sortOrder,
        textSearch,
      ),
    {
      revalidateOnFocus: false,
    },
  );

  return {
    deviceProfiles: data?.data ?? [],
    totalPages: data?.totalPages ?? 0,
    totalElements: data?.totalElements ?? 0,
    hasNext: data?.hasNext ?? false,
    isLoading,
    error,
    mutate,
  };
};
