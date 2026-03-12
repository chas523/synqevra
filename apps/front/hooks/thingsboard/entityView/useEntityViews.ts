"use client";

import useSWR from "swr";
import { EntityViewService } from "@/lib/services/thingsboardServices/entityViewService";
import type { EntityViewsResponse } from "@/types/thingsboardEntityViewTypes";

export const useEntityViews = (
  page: number = 0,
  pageSize: number = 10,
  sortProperty: string = "createdTime",
  sortOrder: "ASC" | "DESC" = "DESC",
  type: string = "",
) => {
  const { data, error, isLoading, mutate } = useSWR<EntityViewsResponse>(
    ["entityViews", page, pageSize, sortProperty, sortOrder, type],
    () =>
      EntityViewService.fetchEntityViews(
        page,
        pageSize,
        sortProperty,
        sortOrder,
        type,
      ),
    {
      revalidateOnFocus: false,
    },
  );

  return {
    entityViews: data?.data ?? [],
    totalPages: data?.totalPages ?? 0,
    totalElements: data?.totalElements ?? 0,
    hasNext: data?.hasNext ?? false,
    isLoading,
    error,
    mutate,
  };
};
