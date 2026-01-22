"use client";

import {useState} from "react";
import {TenantsListPage} from "@/components/pages/TenantsListPage";
import {usePagination, useSortFilter, useTenants} from "@/hooks/dashboard";
import {SORT_OPTIONS} from "@/lib/constants";
import type {TenantsRequestOptions} from "@/lib/types/dashboardTypes";

export const TenantsPage = () => {
  const [options, setOptions] = useState<TenantsRequestOptions>({
    sortBy: "createdTime",
    sortOrder: "desc",
    limit: 20,
  });

  const { data, error, isLoading, mutate } = useTenants(options);
  const { handleSortChange } = useSortFilter({ onOptionsChange: setOptions });
  const { handleNextPage, handlePrevPage } = usePagination({
    onOptionsChange: setOptions,
  });

  return (
    <TenantsListPage
      data={data}
      error={error}
      isLoading={isLoading}
      onRefresh={mutate}
      options={options}
      onSortChange={(value) => handleSortChange(options, value)}
      sortOptions={SORT_OPTIONS.TENANTS}
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
