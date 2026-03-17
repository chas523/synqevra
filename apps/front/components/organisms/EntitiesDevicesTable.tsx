"use client";

import { useState, useCallback } from "react";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Globe,
  Lock,
  UserCheck,
  KeyRound,
  Trash2,
  Loader2,
} from "lucide-react";
import type { Device } from "@/types/thingsboardDeviceTypes";

interface EntitiesDevicesTableProps {
  devices: Device[];
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
  onRowClick?: (device: Device) => void;
  onMakePublic?: (device: Device) => Promise<void>;
  onMakePrivate?: (device: Device) => Promise<void>;
  onAssignToCustomer?: (device: Device) => void;
  onManageCredentials?: (device: Device) => void;
  onDelete?: (device: Device) => Promise<void>;
  onAdd?: () => void;
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

export const EntitiesDevicesTable = ({
  devices,
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
  onMakePublic,
  onMakePrivate,
  onAssignToCustomer,
  onManageCredentials,
  onDelete,
  onAdd,
}: EntitiesDevicesTableProps) => {
  const [loadingDeviceId, setLoadingDeviceId] = useState<string | null>(null);

  const runAction = useCallback(
    async (device: Device, action: (d: Device) => Promise<void>) => {
      const id = device.id?.id ?? "";
      setLoadingDeviceId(id);
      try {
        await action(device);
      } finally {
        setLoadingDeviceId(null);
      }
    },
    [],
  );

  const columns: DataTableColumn<Device>[] = [
    {
      key: "createdTime",
      header: "Created time",
      sortable: true,
      render: (device) => formatDate(device.createdTime),
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "font-medium text-primary",
    },
    {
      key: "label",
      header: "Label",
      sortable: true,
      render: (device) => device.label ?? "-",
    },
    {
      key: "customerTitle",
      header: "Customer",
      sortable: true,
      render: (device) => device.customerTitle ?? "-",
    },
    {
      key: "deviceProfileName",
      header: "Device profile",
      sortable: true,
    },
    {
      key: "customerIsPublic",
      header: "Public",
      sortable: false,
      render: (device) => (
        <Checkbox
          checked={device.customerIsPublic}
          disabled
          className="cursor-default"
        />
      ),
    },
    {
      key: "gateway",
      header: "Gateway",
      sortable: false,
      render: (device) => (
        <Checkbox
          checked={device.additionalInfo?.gateway ?? false}
          disabled
          className="cursor-default"
        />
      ),
    },
    {
      key: "active",
      header: "Status",
      sortable: false,
      render: (device) =>
        device.active ? (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-0">
            Active
          </Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        ),
    },
  ];

  const rowActions = (device: Device) => {
    const id = device.id?.id ?? "";
    const isThisLoading = loadingDeviceId === id;
    const isPublic = Boolean(device.customerIsPublic);

    return (
      <div className="flex items-center gap-0.5">
        {/* Make public */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-blue-500"
              disabled={isThisLoading || isPublic}
              onClick={(e) => {
                e.stopPropagation();
                if (onMakePublic) runAction(device, onMakePublic);
              }}
            >
              {isThisLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Globe className="h-3.5 w-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Make public</TooltipContent>
        </Tooltip>

        {/* Make private */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-slate-700"
              disabled={isThisLoading || !isPublic}
              onClick={(e) => {
                e.stopPropagation();
                if (onMakePrivate) runAction(device, onMakePrivate);
              }}
            >
              <Lock className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Make private</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-green-500"
              disabled={true}
              onClick={(e) => {
                e.stopPropagation();
                onAssignToCustomer?.(device);
              }}
            >
              <UserCheck className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Assign to customer (Coming soon)</TooltipContent>
        </Tooltip>

        {/* Manage credentials */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-amber-500"
              disabled={isThisLoading}
              onClick={(e) => {
                e.stopPropagation();
                onManageCredentials?.(device);
              }}
            >
              <KeyRound className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Manage credentials</TooltipContent>
        </Tooltip>

        {/* Delete */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              disabled={isThisLoading}
              onClick={(e) => {
                e.stopPropagation();
                if (onDelete) runAction(device, onDelete);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </div>
    );
  };

  return (
    <DataTable
      title="Devices"
      data={devices}
      columns={columns}
      getRowId={(device) => device.id?.id ?? ""}
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
      addButtonLabel="Add Device"
      emptyMessage="No devices found."
      loadingMessage="Loading devices..."
    />
  );
};
