"use client";

import { useState } from "react";
import { Building2, Check, X, FileText, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingCard, Pagination } from "../molecules";
import {
  EmptyState,
  ErrorState,
  FilterBar,
  ListHeader,
} from "@/components/organisms";
import { TenantProfileDetailPanel } from "@/components/organisms/TenantProfileDetailPanel";
import type {
  PaginatedResponse,
  TenantProfile,
  TenantsRequestOptions,
} from "@/lib/types/dashboardTypes";
import { formatTenantDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface TenantProfilesListPageProps {
  data?: PaginatedResponse<TenantProfile>;
  error?: any;
  isLoading: boolean;
  onRefresh: () => void;
  options: TenantsRequestOptions;
  onSortChange: (value: string) => void;
  sortOptions: { value: string; label: string }[];
  onNextPage: () => void;
  onPrevPage: () => void;
}

export function TenantProfilesListPage({
  data,
  error,
  isLoading,
  onRefresh,
  options,
  onSortChange,
  sortOptions,
  onNextPage,
  onPrevPage,
}: TenantProfilesListPageProps) {
  const [selectedProfile, setSelectedProfile] = useState<TenantProfile | null>(
    null,
  );

  const handleProfileClick = (profile: TenantProfile) => {
    setSelectedProfile(profile);
  };

  const handleClosePanel = () => {
    setSelectedProfile(null);
  };

  const handleProfileUpdated = (updatedProfile: TenantProfile) => {
    // Update the selected profile to show new data immediately
    setSelectedProfile(updatedProfile);
    // Refresh the list to show updated data
    onRefresh();
  };

  if (error) {
    return (
      <ErrorState
        title="Error Loading Tenant Profiles"
        message={error.message}
        onRetry={onRefresh}
        icon={<FileText className="h-5 w-5" />}
      />
    );
  }

  if (!data && !isLoading) {
    return (
      <EmptyState
        icon={<FileText className="h-12 w-12" />}
        title="No tenant profiles available"
        description="No data found. Try refreshing the page."
      />
    );
  }

  if (isLoading && !data) {
    return (
      <Card className="w-full">
        <ListHeader
          icon={<FileText className="h-5 w-5" />}
          title="Tenant Profiles"
          description="View and manage all tenant profiles"
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
    <>
      <Card className="w-full">
        <ListHeader
          icon={<FileText className="h-5 w-5" />}
          title="Tenant Profiles"
          description="View and manage all tenant profiles"
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
                icon={<FileText className="h-12 w-12" />}
                title="No tenant profiles found"
                description="Try adjusting filters"
              />
            ) : (
              data.data.map((profile) => {
                const isSelected = selectedProfile?.id.id === profile.id.id;
                return (
                  <div
                    key={profile.id.id}
                    onClick={() => handleProfileClick(profile)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleProfileClick(profile)
                    }
                    className={cn(
                      "cursor-pointer rounded-lg border border-border p-4 transition-colors",
                      isSelected
                        ? "border-accent bg-accent/50"
                        : "hover:bg-muted/50",
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <FileText className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-foreground">
                              {profile.name}
                            </h3>
                          </div>

                          {profile.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                              {profile.description}
                            </p>
                          )}

                          <div className="mt-2 text-sm text-muted-foreground">
                            Created: {formatTenantDate(profile.createdTime)}
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Default
                          </span>
                          <div
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded border transition-colors",
                              profile.default
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-transparent text-muted-foreground",
                            )}
                          >
                            {profile.default && (
                              <Check className="h-3.5 w-3.5" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
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

      {/* Detail Panel */}
      <TenantProfileDetailPanel
        tenantProfile={selectedProfile}
        isOpen={!!selectedProfile}
        onClose={handleClosePanel}
        onTenantProfileUpdated={handleProfileUpdated}
      />
    </>
  );
}
