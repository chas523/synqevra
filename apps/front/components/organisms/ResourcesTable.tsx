"use client";

import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import { Button } from "@/components/ui/button";
import Select from "@/components/ui/select";
import {
  Resource,
  ResourceType,
  RESOURCE_TYPE_OPTIONS,
} from "@/types/resourceTypes";
import { Download, Trash2, Check } from "lucide-react";

interface ResourcesTableProps {
  resources: Resource[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  resourceTypeFilter?: ResourceType | "ALL";
  // Sorting
  sortProperty: string;
  sortOrder: "ASC" | "DESC";
  onSortChange: (property: string, order: "ASC" | "DESC") => void;
  // Actions
  onPageChange: (page: number) => void;
  onResourceTypeChange: (type: ResourceType | undefined) => void;
  onRefresh: () => void;
  onAdd: () => void;
  onRowClick: (resource: Resource) => void;
  onDownload: (resource: Resource) => void;
  onDelete: (resource: Resource) => void;
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

const getResourceTypeLabel = (type: string) => {
  const option = RESOURCE_TYPE_OPTIONS.find((o) => o.value === type);
  return option?.label ?? type;
};

export const ResourcesTable = ({
  resources,
  isLoading,
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  resourceTypeFilter = "ALL",
  sortProperty,
  sortOrder,
  onSortChange,
  onPageChange,
  onResourceTypeChange,
  onRefresh,
  onAdd,
  onRowClick,
  onDownload,
  onDelete,
}: ResourcesTableProps) => {
  const columns: DataTableColumn<Resource>[] = [
    {
      key: "createdTime",
      header: "Created time",
      sortable: true,
      render: (resource) => formatDate(resource.createdTime),
    },
    {
      key: "title",
      header: "Title",
      sortable: true,
      className: "font-medium text-primary",
      render: (resource) => resource.title || resource.name,
    },
    {
      key: "resourceType",
      header: "Resource type",
      sortable: true,
      render: (resource) => getResourceTypeLabel(resource.resourceType),
    },
    {
      key: "system",
      header: "System",
      sortable: false,
      className: "text-center",
      render: (resource) =>
        resource.tenantId?.id === "13814000-1dd2-11b2-8080-808080808080" ? (
          <Check className="h-4 w-4 mx-auto text-muted-foreground" />
        ) : null,
    },
  ];

  const rowActions = (resource: Resource) => (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onDownload(resource)}
      >
        <Download className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={() => onDelete(resource)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  const filterComponent = (
    <Select
      value={resourceTypeFilter}
      onValueChange={(value: string) =>
        onResourceTypeChange(
          value === "ALL" ? undefined : (value as ResourceType),
        )
      }
      options={[
        { value: "ALL", label: "All" },
        ...RESOURCE_TYPE_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
        })),
      ]}
      placeholder="Resource type"
      className="w-[180px]"
    />
  );

  return (
    <DataTable
      title="Resources library"
      data={resources}
      columns={columns}
      getRowId={(resource) => resource.id?.id || ""}
      isLoading={isLoading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalElements={totalElements}
      pageSize={pageSize}
      onPageChange={onPageChange}
      sortProperty={sortProperty}
      sortOrder={sortOrder}
      onSortChange={onSortChange}
      onAdd={onAdd}
      onRefresh={onRefresh}
      onRowClick={onRowClick}
      rowActions={rowActions}
      filterComponent={filterComponent}
      emptyMessage="No resources found."
      loadingMessage="Loading resources..."
    />
  );
};
