"use client";

import {
  Building2,
  Calendar,
  Mail,
  MapPin,
  Phone,
  Users,
  Server,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingCard, Pagination } from "../molecules";
import {
  EmptyState,
  ErrorState,
  FilterBar,
  ListHeader,
} from "@/components/organisms";
import type {
  PaginatedResponse,
  Tenant,
  TenantsRequestOptions,
} from "@/lib/types/dashboardTypes";
import { formatTenantDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface TenantsListPageProps {
  data: PaginatedResponse<Tenant> | undefined;
  error: Error | undefined;
  isLoading: boolean;
  onRefresh: () => void;
  options: TenantsRequestOptions;
  onSortChange: (value: string) => void;
  sortOptions: readonly { value: string; label: string }[];
  onNextPage: () => void;
  onPrevPage: () => void;
}

export function TenantsListPage({
  data,
  error,
  isLoading,
  onRefresh,
  options,
  onSortChange,
  sortOptions,
  onNextPage,
  onPrevPage,
}: TenantsListPageProps) {
  const router = useRouter();

  const handleViewUsers = (tenantId: string) => {
    router.push(`/dashboard/tenants/${tenantId}/users`);
  };

  const handleViewDevices = (tenantId: string) => {
    router.push(`/dashboard/tenants/${tenantId}/devices`);
  };

  if (error) {
    return (
      <ErrorState
        title="Error Loading Tenants"
        message={error.message}
        onRetry={onRefresh}
        icon={<Building2 className="h-5 w-5" />}
      />
    );
  }

  if (!data && !isLoading) {
    return (
      <EmptyState
        icon={<Building2 className="h-12 w-12" />}
        title="No tenants available"
        description="No data found.  Try refreshing the page."
      />
    );
  }

  if (isLoading && !data) {
    return (
      <Card className="w-full">
        <ListHeader
          icon={<Building2 className="h-5 w-5" />}
          title="Tenants"
          description="View and manage all tenants"
          count={0}
          isLoading={true}
          onRefresh={onRefresh}
        />
        <CardContent className="space-y-4">
          <LoadingCard count={5} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <ListHeader
        icon={<Building2 className="h-5 w-5" />}
        title="Tenants"
        description="View and manage all tenants"
        count={data?.total || 0}
        isLoading={isLoading}
        onRefresh={onRefresh}
      />

      <CardContent className="space-y-4">
        <FilterBar
          sortValue={`${options.sortBy}-${options.sortOrder}`}
          onSortChange={onSortChange}
          sortOptions={sortOptions}
          showStatusFilter={false}
        />

        <div className="space-y-3">
          {isLoading ? (
            <LoadingCard count={5} />
          ) : !data?.data || data.data.length === 0 ? (
            <EmptyState
              icon={<Building2 className="h-12 w-12" />}
              title="No tenants found"
              description="Try adjusting your filters"
            />
          ) : (
            data.data.map((tenant) => (
              <div
                key={tenant.id.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Building2 className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900">
                        {tenant.title}
                      </h3>
                      <p className="text-sm text-gray-500">{tenant.name}</p>

                      <div className="mt-2 space-y-1">
                        {tenant.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            {tenant.email}
                          </div>
                        )}
                        {(tenant.city || tenant.country) && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            {[tenant.city, tenant.state, tenant.country]
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        )}
                        {tenant.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            {tenant.phone}
                          </div>
                        )}
                        {tenant.createdTime && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {formatTenantDate(tenant.createdTime)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      onClick={() => handleViewUsers(tenant.id.id)}
                      className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-colors whitespace-nowrap"
                      title="View users"
                    >
                      <Users className="h-4 w-4" />
                      <span className="hidden sm:inline">Users</span>
                    </Button>

                    <Button
                      onClick={() => handleViewDevices(tenant.id.id)}
                      className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-md transition-colors whitespace-nowrap"
                      title="View devices"
                    >
                      <Server className="h-4 w-4" />
                      <span className="hidden sm:inline">Devices</span>
                    </Button>
                  </div>
                </div>
              </div>
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
