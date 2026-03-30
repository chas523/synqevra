"use client";

import { useCallback, useState } from "react";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreVertical, Trash2, Users } from "lucide-react";
import type { CustomerInfo } from "@/types/thingsboardAssetTypes";

interface EntitiesCustomersTableProps {
  customers: CustomerInfo[];
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
  onRowClick?: (customer: CustomerInfo) => void;
  onManageUsers?: (customer: CustomerInfo) => void;
  onManageAssets?: (customer: CustomerInfo) => void;
  onManageDevices?: (customer: CustomerInfo) => void;
  onManageDashboards?: (customer: CustomerInfo) => void;
  onManageEdges?: (customer: CustomerInfo) => void;
  onDelete?: (customer: CustomerInfo) => Promise<void>;
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

const isPublicCustomer = (customer: CustomerInfo) => {
  if (customer.additionalInfo?.isPublic) {
    return true;
  }

  const title = (customer.title || customer.name || "").trim().toLowerCase();
  return title === "public";
};

export const EntitiesCustomersTable = ({
  customers,
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
  onManageUsers,
  onManageAssets,
  onManageDevices,
  onManageDashboards,
  onManageEdges,
  onDelete,
}: EntitiesCustomersTableProps) => {
  const [loadingCustomerId, setLoadingCustomerId] = useState<string | null>(
    null,
  );

  const runAction = useCallback(
    async (
      customer: CustomerInfo,
      action: (item: CustomerInfo) => Promise<void>,
    ) => {
      const id = customer.id?.id ?? "";
      setLoadingCustomerId(id);
      try {
        await action(customer);
      } finally {
        setLoadingCustomerId(null);
      }
    },
    [],
  );

  const columns: DataTableColumn<CustomerInfo>[] = [
    {
      key: "createdTime",
      header: "Created time",
      sortable: true,
      render: (customer) => formatDate(customer.createdTime),
    },
    {
      key: "title",
      header: "Title",
      sortable: true,
      className: "font-medium text-primary",
      render: (customer) => customer.title || customer.name || "-",
    },
    {
      key: "email",
      header: "Email",
      sortable: false,
      render: (customer) => customer.email || "-",
    },
    {
      key: "country",
      header: "Country",
      sortable: false,
      render: (customer) => customer.country || "-",
    },
    {
      key: "city",
      header: "City",
      sortable: false,
      render: (customer) => customer.city || "-",
    },
  ];

  const rowActions = (customer: CustomerInfo) => {
    const id = customer.id?.id ?? "";
    const isThisLoading = loadingCustomerId === id;
    const isPublic = isPublicCustomer(customer);
    const scopeLabel = isPublic ? "public" : "customer";

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
            <span className="sr-only">Open customer menu</span>
            {isThisLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreVertical className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            disabled={isPublic}
            onClick={(event) => {
              event.stopPropagation();
              onManageUsers?.(customer);
            }}
          >
            <Users className="mr-2 h-4 w-4" />
            {`Manage ${scopeLabel} users`}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              onManageAssets?.(customer);
            }}
          >
            {`Manage ${scopeLabel} assets`}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              onManageDevices?.(customer);
            }}
          >
            {`Manage ${scopeLabel} devices`}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              onManageDashboards?.(customer);
            }}
          >
            {`Manage ${scopeLabel} dashboards`}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(event) => {
              event.stopPropagation();
              onManageEdges?.(customer);
            }}
          >
            {`Manage ${scopeLabel} edges`}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            disabled={isThisLoading || isPublic}
            onClick={(event) => {
              event.stopPropagation();
              if (onDelete) {
                void runAction(customer, onDelete);
              }
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <DataTable
      title="Customers"
      data={customers}
      columns={columns}
      getRowId={(customer) => customer.id?.id ?? ""}
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
      emptyMessage="No customers found."
      loadingMessage="Loading customers..."
    />
  );
};
