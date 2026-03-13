"use client";

import useSWR from "swr";
import { GatewayService } from "@/lib/services/thingsboardServices/gatewayService";
import type { GatewaysResponse } from "@/types/thingsboardGatewayTypes";

export const useEntityGateways = (
  page: number = 0,
  pageSize: number = 10,
  sortProperty: string = "createdTime",
  sortOrder: "ASC" | "DESC" = "DESC",
) => {
  const { data, error, isLoading, mutate } = useSWR<GatewaysResponse>(
    ["entityGateways", page, pageSize, sortProperty, sortOrder],
    () => GatewayService.fetchGateways(page, pageSize, sortProperty, sortOrder),
    {
      revalidateOnFocus: false,
    },
  );

  return {
    gateways: data?.data ?? [],
    totalPages: data?.totalPages ?? 0,
    totalElements: data?.totalElements ?? 0,
    hasNext: data?.hasNext ?? false,
    isLoading,
    error,
    mutate,
  };
};
