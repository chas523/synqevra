"use client";

import useSWR from "swr";
import { useState } from "react";
import { SettingsService } from "@/lib/services/thingsboardServices/settingsService";
import { MailSettings } from "@/types/mailSettingsTypes";

export const useMailSettings = () => {
    const {
        data: mailSettings,
        error: mailError,
        isLoading: mailLoading,
        mutate,
    } = useSWR<MailSettings>("mail-settings", () =>
        SettingsService.getMailSettings()
    );

    return { mailSettings, mailError, mailLoading, mutate };
};

export const useUpdateMailSettings = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const updateMailSettings = async (mailSettings: MailSettings) => {
        setIsLoading(true);
        setError(null);
        try {
            const settings = await SettingsService.updateMailSettings(mailSettings);
            return settings;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { updateMailSettings, isLoading, error };
};
