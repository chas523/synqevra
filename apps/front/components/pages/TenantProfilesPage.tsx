"use client";

import { useState } from "react";
import { TenantProfilesListPage } from "@/components/pages/TenantProfilesListPage";
import { usePagination, useSortFilter } from "@/hooks/dashboard";
import { SORT_OPTIONS } from "@/lib/constants";
import type { TenantsRequestOptions } from "@/lib/types/dashboardTypes";
import { TenantService } from "@/lib/services/adminServices/tenantService";
import useSWR from "swr";

// Custom hook to fetch tenant profiles since it's not in the original hooks
function useTenantProfiles(options: TenantsRequestOptions) {
    const fetcher = async () => {
        return TenantService.getTenantProfiles(options);
    };

    const key = `tenant-profiles-${JSON.stringify(options)}`;

    const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
        keepPreviousData: true,
    });

    return { data, error, isLoading, mutate };
}

export const TenantProfilesPage = () => {
    const [options, setOptions] = useState<TenantsRequestOptions>({
        sortBy: "createdTime",
        sortOrder: "desc",
        limit: 20,
    });

    const { data, error, isLoading, mutate } = useTenantProfiles(options);
    const { handleSortChange } = useSortFilter({ onOptionsChange: setOptions });
    const { handleNextPage, handlePrevPage } = usePagination({
        onOptionsChange: setOptions,
    });

    return (
        <TenantProfilesListPage
            data={data}
            error={error}
            isLoading={isLoading}
            onRefresh={mutate}
            options={options}
            onSortChange={(value) => handleSortChange(options, value)}
            sortOptions={SORT_OPTIONS.TENANT_PROFILES}
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
