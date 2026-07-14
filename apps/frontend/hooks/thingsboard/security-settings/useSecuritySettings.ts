import { SettingsService } from "@/lib/services/thingsboardServices/settingsService";
import { SecuritySettingsDto } from "@/types/settingsTypes";
import { useState } from "react";
import useSWR from "swr";

export const useSecuritySettings = () => {
  const {
    data: securitySettings,
    error: securityError,
    isLoading: securityLoading,
  } = useSWR<SecuritySettingsDto>("security-settings", () =>
    SettingsService.getSecuritySettings(),
  );

  return { securitySettings, securityError, securityLoading };
};

export const useUpdateSecuritySettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateSecuritySettings = async (
    securitySettingsDto: SecuritySettingsDto,
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const device =
        await SettingsService.updateSecuritySettings(securitySettingsDto);
      return device;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateSecuritySettings, isLoading, error };
};
