"use client";

import useSWR from "swr";
import { useState } from "react";
import { SettingsService } from "@/lib/services/thingsboardServices/settingsService";
import { ConnectivitySettingsDto } from "@/types/generalSettingsTypes";

export const useConnectivitySettings = () => {
  const {
    data: connectivitySettings,
    error: connectivityError,
    isLoading: connectivityLoading,
    mutate,
  } = useSWR<ConnectivitySettingsDto>("connectivity-settings", () =>
    SettingsService.getConnectivitySettings(),
  );

  return {
    connectivitySettings,
    connectivityError,
    connectivityLoading,
    mutate,
  };
};

export const useUpdateConnectivitySettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateConnectivitySettings = async (
    connectivitySettingsDto: ConnectivitySettingsDto,
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const settings = await SettingsService.updateConnectivitySettings(
        connectivitySettingsDto,
      );
      return settings;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateConnectivitySettings, isLoading, error };
};
