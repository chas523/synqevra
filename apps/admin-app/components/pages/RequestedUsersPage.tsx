"use client";
import { Users } from "lucide-react";
import { useState } from "react";
import { BaseListPage } from "@/components/pages";
import {
  useFormFilter,
  usePagination,
  useRequestedUsers,
  useSendEmailActivation,
  useSortFilter,
} from "@/hooks/dashboard";
import { SORT_OPTIONS } from "@/lib/constants";
import type {
  PendingUser,
  RequestedAccessUsersRequestOptions,
} from "@/lib/types/dashboardTypes";

export const RequestedUsersPage = () => {
  const [options, setOptions] = useState<RequestedAccessUsersRequestOptions>({
    sortBy: "createdAt",
    sortOrder: "desc",
    limit: 5,
  });

  const { data, error, isLoading, mutate } = useRequestedUsers(options);
  const { sendEmailActivation, isLoading: emailLoading } =
    useSendEmailActivation();

  const { handleSortChange } = useSortFilter({ onOptionsChange: setOptions });
  const { handleFormStatusChange } = useFormFilter({
    onOptionsChange: setOptions,
  });
  const { handleNextPage, handlePrevPage } = usePagination({
    onOptionsChange: setOptions,
  });

  const onSortChange = (value: string) => handleSortChange(options, value);

  const onStatusChange = (checked: boolean | "indeterminate") => {
    let status: "new" | "pending" | undefined;
    if (checked === true) {
      status = "new";
    } else if (checked === false) {
      status = "pending";
    } else {
      status = undefined;
    }
    handleFormStatusChange(options, status);
  };

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

  const handleSendEmail = async (user: PendingUser) => {
    if (!user.firstName || !user.lastName) return;

    try {
      await sendEmailActivation({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
      mutate();
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  };

  return (
    <BaseListPage
      data={data}
      error={error}
      isLoading={isLoading}
      onRefresh={mutate}
      variant="requested"
      title="Pending Requests"
      description="Users awaiting access approval"
      icon={<Users className="h-5 w-5" />}
      sortValue={`${options.sortBy}-${options.sortOrder}`}
      onSortChange={onSortChange}
      sortOptions={SORT_OPTIONS.REQUESTED_USERS}
      statusValue={
        options.status === "new"
          ? true
          : options.status === "pending"
            ? false
            : undefined
      }
      onStatusChange={onStatusChange}
      onNextPage={onNextPage}
      onPrevPage={onPrevPage}
      onPrimaryAction={handleSendEmail}
      actionLoading={
        emailLoading
          ? { [data?.data.find((u) => u.status === "new")?.id || ""]: true }
          : {}
      }
    />
  );
};
