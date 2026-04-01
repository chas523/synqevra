import useSWR from "swr";
import { DashboardService } from "@/lib/services/thingsboardServices/dashboardService";
import { DashboardsResponse } from "@/types/dashboardTypes";

export function useDashboards(
  page: number = 0,
  pageSize: number = 10,
  sortProperty: string = "createdTime",
  sortOrder: "ASC" | "DESC" = "DESC",
) {
  const { data, error, isLoading, mutate } = useSWR<DashboardsResponse>(
    `/api/tenant/dashboards?pageSize=${pageSize}&page=${page}&sortProperty=${sortProperty}&sortOrder=${sortOrder}`,
    () =>
      DashboardService.getTenantDashboards(
        pageSize,
        page,
        sortProperty,
        sortOrder,
      ),
    {
      keepPreviousData: true,
    },
  );

  return {
    dashboards: data?.data || [],
    totalPages: data?.totalPages || 0,
    totalElements: data?.totalElements || 0,
    hasNext: data?.hasNext || false,
    isLoading,
    isError: error,
    mutate,
  };
}
