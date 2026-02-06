"use client";

import useSWR from "swr";
import { useState } from "react";
import { SettingsService } from "@/lib/services/thingsboardServices/settingsService";
import { NotificationSettings } from "@/types/notificationSettingsTypes";

export const useNotificationSettings = () => {
    const {
        data: notificationSettings,
        error: notificationError,
        isLoading: notificationLoading,
        mutate,
    } = useSWR<NotificationSettings>("notification-settings", () =>
        SettingsService.getNotificationSettings()
    );

    return { notificationSettings, notificationError, notificationLoading, mutate };
};

export const useUpdateNotificationSettings = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const updateNotificationSettings = async (
        notificationSettingsDto: NotificationSettings
    ) => {
        setIsLoading(true);
        setError(null);
        try {
            const settings = await SettingsService.updateNotificationSettings(
                notificationSettingsDto
            );
            return settings;
        } catch (err) {
            setError(err as Error);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { updateNotificationSettings, isLoading, error };
};
