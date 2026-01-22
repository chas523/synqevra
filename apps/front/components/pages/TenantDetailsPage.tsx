"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone, Calendar, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTenants } from "@/hooks/dashboard/useTenants";
import {
  useTenantUsers,
  usePagination,
  useSortFilter,
} from "@/hooks/dashboard";
import { SORT_OPTIONS } from "@/lib/constants";
import type { TenantsRequestOptions } from "@/lib/types/dashboardTypes";
import { LoadingCard, Pagination } from "@/components/molecules";
import {
  EmptyState,
  ErrorState,
  FilterBar,
  ListHeader,
} from "@/components/organisms";
import { TenantUserCard } from "@/components/organisms/TenantUserCard";
import { formatTenantDate } from "@/lib/utils";

interface TenantDetailsPageProps {
  tenantId: string;
}

export const TenantDetailsPage = ({ tenantId }: TenantDetailsPageProps) => {
  const router = useRouter();

  // Pobranie danych tenanta
  const { data: tenantsData } = useTenants({ limit: 100 });
  const tenant = tenantsData?.data.find((t) => t.id.id === tenantId);

  // Opcje dla użytkowników
  const [usersOptions, setUsersOptions] = useState<TenantsRequestOptions>({
    sortBy: "createdTime",
    sortOrder: "desc",
    limit: 20,
  });

  // Pobranie użytkowników tenanta
  const {
    data: usersData,
    error: usersError,
    isLoading: usersLoading,
    mutate: usersRefresh,
  } = useTenantUsers(tenantId, usersOptions);

  const { handleSortChange } = useSortFilter({
    onOptionsChange: setUsersOptions,
  });
  const { handleNextPage, handlePrevPage } = usePagination({
    onOptionsChange: setUsersOptions,
  });

  const handleSortChangeUsers = (value: string) =>
    handleSortChange(usersOptions, value);

  const handleNextPageUsers = () =>
    handleNextPage(
      usersOptions,
      !!usersData?.pagination.hasNext,
      usersData?.pagination.nextCursor,
    );

  const handlePrevPageUsers = () =>
    handlePrevPage(
      usersOptions,
      !!usersData?.pagination.hasPrev,
      usersData?.pagination.prevCursor,
    );

  if (!tenant) {
    return (
      <div className="space-y-4">
        <Button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tenants
        </Button>
        <ErrorState
          title="Tenant Not Found"
          message="The tenant you're looking for doesn't exist."
          onRetry={() => router.back()}
          icon={<Users className="h-5 w-5" />}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tenants
        </Button>

        <Card className="w-full">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {tenant.title}
                </h1>
                <p className="text-gray-500 mt-1">{tenant.name}</p>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tenant.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{tenant.email}</span>
                    </div>
                  )}

                  {(tenant.city || tenant.country) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>
                        {[tenant.city, tenant.state, tenant.country]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}

                  {tenant.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{tenant.phone}</span>
                    </div>
                  )}

                  {tenant.createdTime && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{formatTenantDate(tenant.createdTime)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="w-full">
        <ListHeader
          icon={<Users className="h-5 w-5" />}
          title="Users"
          description={`Users in ${tenant.title}`}
          count={usersData?.total || 0}
          isLoading={usersLoading}
          onRefresh={usersRefresh}
        />

        <CardContent className="space-y-4">
          <FilterBar
            sortValue={`${usersOptions.sortBy}-${usersOptions.sortOrder}`}
            onSortChange={handleSortChangeUsers}
            sortOptions={SORT_OPTIONS.ACTIVE_USERS}
            showStatusFilter={false}
          />

          <div className="space-y-3">
            {usersError ? (
              <ErrorState
                title="Error Loading Users"
                message={usersError.message}
                onRetry={usersRefresh}
                icon={<Users className="h-5 w-5" />}
              />
            ) : usersLoading && !usersData ? (
              <LoadingCard count={5} />
            ) : !usersData?.data || usersData.data.length === 0 ? (
              <EmptyState
                icon={<Users className="h-12 w-12" />}
                title="No users found"
                description="This tenant has no users yet."
              />
            ) : (
              usersData.data.map((user) => (
                <TenantUserCard key={user.id.id} user={user} />
              ))
            )}
          </div>

          {usersData && (
            <Pagination
              hasNext={usersData.pagination.hasNext}
              hasPrev={usersData.pagination.hasPrev}
              currentCount={usersData.data.length}
              total={usersData.total}
              isLoading={usersLoading}
              onNext={handleNextPageUsers}
              onPrev={handlePrevPageUsers}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
