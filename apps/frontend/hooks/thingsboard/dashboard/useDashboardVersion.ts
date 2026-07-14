import { DashboardVersionService } from "@/lib/services/thingsboardServices/versionService";
import { DashboardVersionResponse } from "@/types/versionTypes";
import useSWR from "swr";

export const useDashboardVersion = () => {
  const { data, error, isLoading } = useSWR<DashboardVersionResponse>(
    "dashboard-version",
    () => DashboardVersionService.getThingsboardVersion(),
  );

  return {
    data,
    isLoading,
    error,
  };
};
