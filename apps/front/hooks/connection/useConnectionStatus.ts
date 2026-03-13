"use client";

import useSWR from "swr";
import { proxyApi } from "@/lib/api/api";

interface ConnectionStatus {
  medplum: boolean;
}

export function useConnectionStatus() {
  const { data, error, isLoading } = useSWR<ConnectionStatus>(
    "/connection/me/status",
    async () => {
      const response = await proxyApi.get<ConnectionStatus>(
        "/connection/me/status",
      );
      return response.data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return {
    hasMedplum: data?.medplum ?? false,
    isLoading,
    error: error ?? null,
  };
}
