"use client";

import useSWR from "swr";
import { AssetService } from "@/lib/services/thingsboardServices/assetService";
import type { AssetProfilesResponse } from "@/types/thingsboardAssetTypes";

export const useEntityAssetProfiles = (
  page: number = 0,
  pageSize: number = 10,
  sortProperty: string = "createdTime",
  sortOrder: "ASC" | "DESC" = "DESC",
  textSearch?: string,
) => {
  const { data, error, isLoading, mutate } = useSWR<AssetProfilesResponse>(
    [
      "entityAssetProfiles",
      page,
      pageSize,
      sortProperty,
      sortOrder,
      textSearch,
    ],
    () =>
      AssetService.fetchAssetProfiles(
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
    assetProfiles: data?.data ?? [],
    totalPages: data?.totalPages ?? 0,
    totalElements: data?.totalElements ?? 0,
    hasNext: data?.hasNext ?? false,
    isLoading,
    error,
    mutate,
  };
};
