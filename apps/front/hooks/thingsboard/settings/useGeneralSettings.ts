"use client";

import useSWR from "swr";
import { useState } from "react";
import { SettingsService } from "@/lib/services/thingsboardServices/settingsService";
import { GeneralSettingsDto } from "@/types/generalSettingsTypes";

export const useGeneralSettings = () => {
    const {
        data: generalSettings,
        error: generalError,
        isLoading: generalLoading,
        mutate,
    } = useSWR<GeneralSettingsDto>("general-settings", () =>
        SettingsService.getGeneralSettings()
    );

    return { generalSettings, generalError, generalLoading, mutate };
};

export const useUpdateGeneralSettings = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const updateGeneralSettings = async (
        generalSettingsDto: GeneralSettingsDto
    ) => {
        setIsLoading(true);
        setError(null);
        try {
            const settings =
                await SettingsService.updateGeneralSettings(generalSettingsDto);
            return settings;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { updateGeneralSettings, isLoading, error };
};
