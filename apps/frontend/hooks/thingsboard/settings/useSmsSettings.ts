"use client";

import useSWR from "swr";
import { useState } from "react";
import { SettingsService } from "@/lib/services/thingsboardServices/settingsService";
import { SmsSettings } from "@/types/notificationSettingsTypes";

export const useSmsSettings = () => {
  const {
    data: smsSettings,
    error: smsError,
    isLoading: smsLoading,
    mutate,
  } = useSWR<SmsSettings | null>("sms-settings", async () => {
    try {
      return await SettingsService.getSmsSettings();
    } catch (error: any) {
      // Error code 32: "No Administration settings found for key: sms"
      if (
        error?.response?.status === 404 &&
        error?.response?.data?.errorCode === 32
      ) {
        return null;
      }
      throw error;
    }
  });

  return { smsSettings, smsError, smsLoading, mutate };
};

export const useUpdateSmsSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateSmsSettings = async (smsSettingsDto: SmsSettings) => {
    setIsLoading(true);
    setError(null);
    try {
      const settings = await SettingsService.updateSmsSettings(smsSettingsDto);
      return settings;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateSmsSettings, isLoading, error };
};
