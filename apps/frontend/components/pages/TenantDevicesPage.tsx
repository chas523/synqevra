"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
  Calendar,
  Server,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTenants } from "@/hooks/dashboard/useTenants";
import {
  useTenantDevices,
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
import { TenantDeviceCard } from "@/components/organisms/TenantDeviceCard";
import { Button } from "@/components/ui/button";

interface TenantDevicesPageProps {
  tenantId: string;
}

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const TenantDevicesPage = ({ tenantId }: TenantDevicesPageProps) => {
  const router = useRouter();

  const { data: tenantsData, isLoading: tenantLoading } = useTenants({
    limit: 100,
  });
  const tenant = tenantsData?.data.find((t) => t.id.id === tenantId);

  const [devicesOptions, setDevicesOptions] = useState<TenantsRequestOptions>({
    sortBy: "createdTime",
    sortOrder: "desc",
    limit: 20,
  });

  const {
    data: devicesData,
    error: devicesError,
    isLoading: devicesLoading,
    mutate: devicesRefresh,
  } = useTenantDevices(tenantId, devicesOptions);

  const { handleSortChange } = useSortFilter({
    onOptionsChange: setDevicesOptions,
  });
  const { handleNextPage, handlePrevPage } = usePagination({
    onOptionsChange: setDevicesOptions,
  });

  const handleSortChangeDevices = (value: string) =>
    handleSortChange(devicesOptions, value);

  const handleNextPageDevices = () =>
    handleNextPage(
      devicesOptions,
      !!devicesData?.pagination.hasNext,
      devicesData?.pagination.nextCursor,
    );

  const handlePrevPageDevices = () =>
    handlePrevPage(
      devicesOptions,
      !!devicesData?.pagination.hasPrev,
      devicesData?.pagination.prevCursor,
    );

  if (tenantLoading) {
    return <LoadingCard count={2} />;
  }

  if (!tenant) {
    return (
      <div className="space-y-4">
        <Button
          size="lg"
          onClick={() => router.back()}
          className="mb-4 cursor-pointer gap-2 bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tenants
        </Button>
        <ErrorState
          title="Tenant Not Found"
          message="The tenant you're looking for doesn't exist."
          onRetry={() => router.back()}
          icon={<Server className="h-5 w-5" />}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          size="lg"
          onClick={() => router.back()}
          className="mb-4 cursor-pointer gap-2 bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg"
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

                <div className="mt-4 grid md: grid-cols-2 gap-4">
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
                      <span>{formatDate(tenant.createdTime)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Devices List */}
      <Card className="w-full">
        <ListHeader
          icon={<Server className="h-5 w-5" />}
          title="Devices"
          description={`Devices in ${tenant.title}`}
          count={devicesData?.total || 0}
          isLoading={devicesLoading}
          onRefresh={devicesRefresh}
        />

        <CardContent className="space-y-4">
          <FilterBar
            sortValue={`${devicesOptions.sortBy}-${devicesOptions.sortOrder}`}
            onSortChange={handleSortChangeDevices}
            sortOptions={SORT_OPTIONS.DEVICES}
            showStatusFilter={false}
          />

          <div className="space-y-3">
            {devicesError && !devicesLoading ? (
              <ErrorState
                title="Error Loading Devices"
                message={devicesError.message}
                onRetry={devicesRefresh}
                icon={<Server className="h-5 w-5" />}
              />
            ) : devicesLoading && !devicesData ? (
              <LoadingCard count={5} />
            ) : !devicesData?.data || devicesData.data.length === 0 ? (
              <EmptyState
                icon={<Server className="h-12 w-12" />}
                title="No devices found"
                description="This tenant has no devices yet."
              />
            ) : (
              devicesData.data.map((device) => (
                <TenantDeviceCard key={device.id.id} device={device} />
              ))
            )}
          </div>

          {devicesData && (
            <Pagination
              hasNext={devicesData.pagination.hasNext}
              hasPrev={devicesData.pagination.hasPrev}
              currentCount={devicesData.data.length}
              total={devicesData.total}
              isLoading={devicesLoading}
              onNext={handleNextPageDevices}
              onPrev={handlePrevPageDevices}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
