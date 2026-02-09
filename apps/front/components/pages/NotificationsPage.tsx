"use client";

import { useState } from "react";
import { NotificationsListPage } from "@/components/pages/NotificationsListPage";
import {
    usePagination,
    useSortFilter,
    useNotifications,
} from "@/hooks/dashboard";
import { SORT_OPTIONS } from "@/lib/constants";
import type { NotificationsRequestOptions } from "@/lib/types/dashboardTypes";

export const NotificationsPage = () => {
    const [options, setOptions] = useState<NotificationsRequestOptions>({
        sortBy: "createdTime",
        sortOrder: "desc",
        limit: 20,
    });

    const { data, error, isLoading, mutate } = useNotifications(options);
    const { handleSortChange } = useSortFilter({ onOptionsChange: setOptions });
    const { handleNextPage, handlePrevPage } = usePagination({
        onOptionsChange: setOptions,
    });

    return (
        <NotificationsListPage
            data={data}
            error={error}
            isLoading={isLoading}
            onRefresh={mutate}
            options={options}
            onSortChange={(value) => handleSortChange(options, value)}
            sortOptions={SORT_OPTIONS.NOTIFICATIONS}
            onNextPage={() =>
                handleNextPage(
                    options,
                    !!data?.pagination.hasNext,
                    data?.pagination.nextCursor,
                )
            }
            onPrevPage={() =>
                handlePrevPage(
                    options,
                    !!data?.pagination.hasPrev,
                    data?.pagination.prevCursor,
                )
            }
        />
    );
};
