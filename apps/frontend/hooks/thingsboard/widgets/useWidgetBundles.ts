"use client";

import useSWR from "swr";
import { WidgetService } from "@/lib/services/thingsboardServices/widgetService";
import { WidgetBundlesPage } from "@/types/widgetTypes";

export const useWidgetBundles = (
  page: number = 0,
  pageSize: number = 10,
  sortProperty: string = "title",
  sortOrder: "ASC" | "DESC" = "ASC",
  tenantOnly: boolean = false,
  fullSearch: boolean = false,
  scadaFirst: boolean = false,
) => {
  const { data, error, isLoading, mutate } = useSWR<WidgetBundlesPage>(
    [
      "widgetBundles",
      page,
      pageSize,
      sortProperty,
      sortOrder,
      tenantOnly,
      fullSearch,
      scadaFirst,
    ],
    () =>
      WidgetService.getWidgetBundles(
        page,
        pageSize,
        sortProperty,
        sortOrder,
        tenantOnly,
        fullSearch,
        scadaFirst,
      ),
    {
      revalidateOnFocus: false,
    },
  );

  return {
    widgetBundles: data?.data ?? [],
    totalPages: data?.totalPages ?? 0,
    totalElements: data?.totalElements ?? 0,
    hasNext: data?.hasNext ?? false,
    isLoading,
    error,
    mutate,
  };
};
