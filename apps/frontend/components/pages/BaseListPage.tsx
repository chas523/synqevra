import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingCard, Pagination } from "../molecules";
import { EmptyState } from "@/components/organisms";
import { ErrorState } from "@/components/organisms";
import { FilterBar } from "@/components/organisms";
import { ListHeader } from "@/components/organisms";
import { UserCard } from "../organisms/UserCard";

interface BaseUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
  status?: "new" | "pending";
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextCursor?: string;
    prevCursor?: string;
  };
  total: number;
}

interface BaseListPageProps<T extends BaseUser> {
  data: PaginatedResponse<T> | undefined;
  error: Error | undefined;
  isLoading: boolean;
  onRefresh: () => void;

  variant: "requested" | "active";
  title: string;
  description: string;
  icon: React.ReactNode;

  sortValue: string;
  onSortChange: (value: string) => void;
  sortOptions: readonly { value: string; label: string }[];

  statusValue?: boolean | undefined;
  onStatusChange?: (value: boolean | "indeterminate") => void;

  onNextPage: () => void;
  onPrevPage: () => void;

  onPrimaryAction?: (user: T) => void;
  onSecondaryAction?: (user: T) => void;
  actionLoading?: Record<string, boolean>;
}

export function BaseListPage<T extends BaseUser>({
  data,
  error,
  isLoading,
  onRefresh,
  variant,
  title,
  description,
  icon,
  sortValue,
  onSortChange,
  sortOptions,
  statusValue,
  onStatusChange,
  onNextPage,
  onPrevPage,
  onPrimaryAction,
  onSecondaryAction,
  actionLoading = {},
}: BaseListPageProps<T>) {
  if (error) {
    return (
      <ErrorState
        title={`Error Loading ${variant === "requested" ? "Requests" : "Users"}`}
        message={error.message}
        onRetry={onRefresh}
        icon={<Users className="h-5 w-5" />}
      />
    );
  }

  if (!data && !isLoading) {
    return (
      <EmptyState
        icon={<Users className="h-12 w-12" />}
        title={`No ${variant === "requested" ? "requests" : "users"} available`}
        description="No data found. Try refreshing the page."
      />
    );
  }

  if (isLoading && !data) {
    return (
      <Card className="w-full">
        <ListHeader
          icon={icon}
          title={title}
          description={description}
          count={0}
          isLoading={true}
          onRefresh={onRefresh}
        />
        <CardContent className="space-y-4">
          <LoadingCard count={5} showActions={variant === "requested"} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <ListHeader
        icon={icon}
        title={title}
        description={description}
        count={data?.total || 0}
        isLoading={isLoading}
        onRefresh={onRefresh}
      />

      <CardContent className="space-y-4">
        <FilterBar
          sortValue={sortValue}
          onSortChange={onSortChange}
          sortOptions={sortOptions}
          statusValue={statusValue}
          onStatusChange={onStatusChange}
          showStatusFilter={variant === "requested" && !!onStatusChange}
        />

        <div className="space-y-3">
          {isLoading ? (
            <LoadingCard count={5} showActions={variant === "requested"} />
          ) : !data?.data || data.data.length === 0 ? (
            <EmptyState
              icon={<Users className="h-12 w-12" />}
              title={`No ${variant === "requested" ? "requests" : "users"} found`}
              description="Try adjusting your filters"
            />
          ) : (
            data?.data.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                variant={variant}
                onPrimaryAction={() => onPrimaryAction?.(user)}
                onSecondaryAction={() => onSecondaryAction?.(user)}
                isLoading={actionLoading[user.id] || false}
              />
            ))
          )}
        </div>

        <Pagination
          hasNext={data?.pagination?.hasNext ?? false}
          hasPrev={data?.pagination?.hasPrev ?? false}
          currentCount={data?.data?.length ?? 0}
          total={data?.total ?? 0}
          isLoading={isLoading}
          onNext={onNextPage}
          onPrev={onPrevPage}
        />
      </CardContent>
    </Card>
  );
}
