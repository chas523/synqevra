"use client";

import { Users } from "lucide-react";
import { useState } from "react";
import { BaseListPage } from "@/components/pages";
import {
  useActiveUsers,
  usePagination,
  useSortFilter,
} from "@/hooks/dashboard";
import { SORT_OPTIONS } from "@/lib/constants";
import type { ActiveUsersRequestOptions } from "@/lib/types/dashboardTypes";

export const ActiveUsersPage = () => {
  const [options, setOptions] = useState<ActiveUsersRequestOptions>({
    sortBy: "createdAt",
    sortOrder: "desc",
    limit: 10,
  });

  const { data, error, isLoading, mutate } = useActiveUsers(options);

  const { handleSortChange } = useSortFilter({ onOptionsChange: setOptions });
  const { handleNextPage, handlePrevPage } = usePagination({
    onOptionsChange: setOptions,
  });

  const onSortChange = (value: string) => handleSortChange(options, value);

  const onNextPage = () =>
    handleNextPage(
      options,
      !!data?.pagination.hasNext,
      data?.pagination.nextCursor,
    );

  const onPrevPage = () =>
    handlePrevPage(
      options,
      !!data?.pagination.hasPrev,
      data?.pagination.prevCursor,
    );

  return (
    <BaseListPage
      data={data}
      error={error}
      isLoading={isLoading}
      onRefresh={mutate}
      variant="active"
      title="Active Users"
      description="View and manage active user accounts"
      icon={<Users className="h-5 w-5" />}
      sortValue={`${options.sortBy}-${options.sortOrder}`}
      onSortChange={onSortChange}
      sortOptions={SORT_OPTIONS.ACTIVE_USERS}
      onNextPage={onNextPage}
      onPrevPage={onPrevPage}
    />
  );
};
