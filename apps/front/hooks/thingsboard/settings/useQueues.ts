import useSWR from "swr";
import { SettingsService } from "@/lib/services/thingsboardServices/settingsService";
import { Queue, QueuesPageResponse } from "@/types/queueTypes";
import { useState } from "react";

export const useQueues = (
    page: number = 0,
    pageSize: number = 10,
    sortProperty: string = "createdTime",
    sortOrder: "ASC" | "DESC" = "DESC"
) => {
    const { data, error, isLoading, mutate } = useSWR<QueuesPageResponse>(
        [`thingsboard/queues`, page, pageSize, sortProperty, sortOrder],
        () => SettingsService.getQueues(page, pageSize, sortProperty, sortOrder)
    );

    return {
        queuesData: data,
        isLoading,
        isError: error,
        mutate,
    };
};

export const useManageQueue = () => {
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const createOrUpdateQueue = async (queue: Queue) => {
        setIsSaving(true);
        try {
            await SettingsService.createQueue(queue);
        } finally {
            setIsSaving(false);
        }
    };

    const deleteQueue = async (queueId: string) => {
        setIsDeleting(true);
        try {
            await SettingsService.deleteQueue(queueId);
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        createOrUpdateQueue,
        deleteQueue,
        isSaving,
        isDeleting,
    };
};
