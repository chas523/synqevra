"use client";

import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Download, Loader2, Star, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import type { DeviceProfile } from "@/lib/services/thingsboardServices/deviceService";
import type { ReactNode } from "react";

interface EntitiesDeviceProfilesTableProps {
  deviceProfiles: DeviceProfile[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  sortProperty: string;
  sortOrder: "ASC" | "DESC";
  onSortChange: (property: string, order: "ASC" | "DESC") => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onRowClick?: (profile: DeviceProfile) => void;
  onExport?: (profile: DeviceProfile) => Promise<void>;
  onMakeDefault?: (profile: DeviceProfile) => Promise<void>;
  onDelete?: (profile: DeviceProfile) => Promise<void>;
  onAdd?: () => void;
  customAction?: ReactNode;
}

const formatDate = (timestamp?: number) => {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const EntitiesDeviceProfilesTable = ({
  deviceProfiles,
  isLoading,
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  sortProperty,
  sortOrder,
  onSortChange,
  onPageChange,
  onRefresh,
  onRowClick,
  onExport,
  onMakeDefault,
  onDelete,
  onAdd,
  customAction,
}: EntitiesDeviceProfilesTableProps) => {
  const [loadingProfileId, setLoadingProfileId] = useState<string | null>(null);

  const runAction = useCallback(
    async (
      profile: DeviceProfile,
      action: (p: DeviceProfile) => Promise<void>,
    ) => {
      const id = profile.id?.id ?? "";
      setLoadingProfileId(id);
      try {
        await action(profile);
      } finally {
        setLoadingProfileId(null);
      }
    },
    [],
  );

  const columns: DataTableColumn<DeviceProfile>[] = [
    {
      key: "createdTime",
      header: "Created Time",
      sortable: true,
      render: (profile) => formatDate(profile.createdTime),
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "font-medium text-primary",
    },
    {
      key: "description",
      header: "Description",
      sortable: true,
      render: (profile) => profile.description ?? "-",
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
    },
    {
      key: "transportType",
      header: "Transport Type",
      sortable: true,
      render: (profile) => profile.transportType ?? "-",
    },
    {
      key: "default",
      header: "Default",
      sortable: false,
      render: (profile) => (
        <Checkbox
          checked={profile.default}
          disabled
          className="cursor-default"
        />
      ),
    },
  ];

  const rowActions = (profile: DeviceProfile) => {
    const id = profile.id?.id ?? "";
    const isThisLoading = loadingProfileId === id;
    const isDefault = Boolean(profile.default);

    return (
      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-blue-500"
              disabled={isThisLoading}
              onClick={(event) => {
                event.stopPropagation();
                if (onExport) runAction(profile, onExport);
              }}
            >
              {isThisLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export Profile</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-amber-500"
              disabled={isThisLoading || isDefault}
              onClick={(event) => {
                event.stopPropagation();
                if (onMakeDefault) runAction(profile, onMakeDefault);
              }}
            >
              <Star className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Set as Default</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              disabled={isThisLoading || isDefault}
              onClick={(event) => {
                event.stopPropagation();
                if (onDelete) runAction(profile, onDelete);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete Profile</TooltipContent>
        </Tooltip>
      </div>
    );
  };

  return (
    <DataTable
      title="Device Profiles"
      data={deviceProfiles}
      columns={columns}
      getRowId={(profile) => profile.id?.id ?? ""}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalElements={totalElements}
      pageSize={pageSize}
      onPageChange={onPageChange}
      sortProperty={sortProperty}
      sortOrder={sortOrder}
      onSortChange={onSortChange}
      onRefresh={onRefresh}
      onRowClick={onRowClick}
      rowActions={rowActions}
      onAdd={onAdd}
      addButtonLabel="Add Profile"
      customAction={customAction}
      emptyMessage="No device profiles found."
      loadingMessage="Loading device profiles..."
    />
  );
};
