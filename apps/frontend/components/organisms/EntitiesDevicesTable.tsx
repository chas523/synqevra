"use client";

import { ReactNode, useState, useCallback } from "react";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Download,
  Globe,
  KeyRound,
  Lock,
  Loader2,
  MoreVertical,
  Trash2,
  UserCheck,
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
  onExport?: (device: Device) => void;
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
  onExport,
  onAdd,
  customAction,
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
      <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
        {isThisLoading && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground mr-1" />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onExport?.(device)}>
              <Download className="mr-2 h-4 w-4" />
              Export JSON
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isPublic}
              onClick={() => {
                if (onMakePublic) runAction(device, onMakePublic);
              }}
            >
              <Globe className="mr-2 h-4 w-4" />
              Make public
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={!isPublic}
              onClick={() => {
                if (onMakePrivate) runAction(device, onMakePrivate);
              }}
            >
              <Lock className="mr-2 h-4 w-4" />
              Make private
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onManageCredentials?.(device)}>
              <KeyRound className="mr-2 h-4 w-4" />
              Manage credentials
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <UserCheck className="mr-2 h-4 w-4" />
              Assign to customer
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                if (onDelete) runAction(device, onDelete);
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete device
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
      customAction={customAction}
      emptyMessage="No devices found."
      loadingMessage="Loading devices..."
    />
  );
};
