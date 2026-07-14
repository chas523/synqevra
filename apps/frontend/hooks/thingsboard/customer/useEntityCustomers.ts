"use client";

import useSWR from "swr";
import { AssetService } from "@/lib/services/thingsboardServices/assetService";
import type { CustomersResponse } from "@/types/thingsboardAssetTypes";

export const useEntityCustomers = (
  page: number = 0,
  pageSize: number = 10,
  sortProperty: string = "createdTime",
  sortOrder: "ASC" | "DESC" = "DESC",
) => {
  const { data, error, isLoading, mutate } = useSWR<CustomersResponse>(
    ["entityCustomers", page, pageSize, sortProperty, sortOrder],
    () =>
      AssetService.getCustomers(page, pageSize, sortProperty, sortOrder, ""),
    {
      revalidateOnFocus: false,
    },
  );

  return {
    customers: data?.data ?? [],
    totalPages: data?.totalPages ?? 0,
    totalElements: data?.totalElements ?? 0,
    hasNext: data?.hasNext ?? false,
    isLoading,
    error,
    mutate,
  };
};
