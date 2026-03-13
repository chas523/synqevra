"use client";

import { useCallback, useState } from "react";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Loader2,
  MoreVertical,
  Plug,
  Settings,
  TerminalSquare,
  Trash2,
} from "lucide-react";
import type { GatewayListItem } from "@/types/thingsboardGatewayTypes";

interface EntitiesGatewaysTableProps {
  gateways: GatewayListItem[];
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
  onAdd?: () => void;
  onLaunchCommand?: (gateway: GatewayListItem) => void;
  onGeneralConfiguration?: (gateway: GatewayListItem) => void;
  onConnectors?: (gateway: GatewayListItem) => void;
  onDelete?: (gateway: GatewayListItem) => Promise<void>;
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

export const EntitiesGatewaysTable = ({
  gateways,
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
  onAdd,
  onLaunchCommand,
  onGeneralConfiguration,
  onConnectors,
  onDelete,
}: EntitiesGatewaysTableProps) => {
  const [loadingGatewayId, setLoadingGatewayId] = useState<string | null>(null);

  const runAction = useCallback(
    async (
      gateway: GatewayListItem,
      action: (item: GatewayListItem) => Promise<void>,
    ) => {
      const id = gateway.id?.id ?? "";
      setLoadingGatewayId(id);
      try {
        await action(gateway);
      } finally {
        setLoadingGatewayId(null);
      }
    },
    [],
  );

  const columns: DataTableColumn<GatewayListItem>[] = [
    {
      key: "createdTime",
      header: "Created time",
      sortable: true,
      render: (gateway) => formatDate(gateway.createdTime),
    },
    {
      key: "name",
      header: "Gateway name",
      sortable: true,
      className: "font-medium text-primary",
    },
    {
      key: "active",
      header: "Status",
      sortable: false,
      render: (gateway) =>
        gateway.active ? (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-0">
            Active
          </Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        ),
    },
    {
      key: "enabledConnectors",
      header: "Enabled Connectors",
      sortable: false,
      render: (gateway) => gateway.enabledConnectors,
    },
    {
      key: "gatewayVersion",
      header: "Version",
      sortable: false,
      render: (gateway) => gateway.gatewayVersion || "-",
    },
  ];

  const rowActions = (gateway: GatewayListItem) => {
    const id = gateway.id?.id ?? "";
    const isThisLoading = loadingGatewayId === id;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
            <span className="sr-only">Open gateway menu</span>
            {isThisLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreVertical className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              onLaunchCommand?.(gateway);
            }}
          >
            <TerminalSquare className="mr-2 h-4 w-4" />
            Launch command
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              onGeneralConfiguration?.(gateway);
            }}
          >
            <Settings className="mr-2 h-4 w-4" />
            General configuration
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              onConnectors?.(gateway);
            }}
          >
            <Plug className="mr-2 h-4 w-4" />
            Connectors
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            disabled={isThisLoading}
            onClick={(event) => {
              event.stopPropagation();
              if (onDelete) {
                void runAction(gateway, onDelete);
              }
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete gateway
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <DataTable
      title="Gateways"
      data={gateways}
      columns={columns}
      getRowId={(gateway) => gateway.id?.id ?? ""}
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
      onAdd={onAdd}
      addButtonLabel="Add Gateway"
      rowActions={rowActions}
      emptyMessage="No gateways found."
      loadingMessage="Loading gateways..."
    />
  );
};
