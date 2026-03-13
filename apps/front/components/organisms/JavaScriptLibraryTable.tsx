"use client";

import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import { Button } from "@/components/ui/button";
import Select from "@/components/ui/select";
import { Resource, ResourceSubType } from "@/types/resourceTypes";
import { Download, Trash2, Check } from "lucide-react";

interface JavaScriptLibraryTableProps {
  resources: Resource[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  resourceSubTypeFilter?: string;
  // Sorting
  sortProperty: string;
  sortOrder: "ASC" | "DESC";
  onSortChange: (property: string, order: "ASC" | "DESC") => void;
  // Actions
  onPageChange: (page: number) => void;
  onResourceSubTypeChange: (subType: string | undefined) => void;
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

const getResourceSubTypeLabel = (subType?: string | null) => {
  if (!subType) return "-";
  // Capitalize first letter
  return subType.charAt(0).toUpperCase() + subType.slice(1).toLowerCase();
};

export const JavaScriptLibraryTable = ({
  resources,
  isLoading,
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  resourceSubTypeFilter = "ALL",
  sortProperty,
  sortOrder,
  onSortChange,
  onPageChange,
  onResourceSubTypeChange,
  onRefresh,
  onAdd,
  onRowClick,
  onDownload,
  onDelete,
}: JavaScriptLibraryTableProps) => {
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
      key: "resourceSubType",
      header: "JavaScript type",
      sortable: false, // API sorting usually on standard fields, check if subType is sortable (likely not easily)
      render: (resource) => getResourceSubTypeLabel(resource.resourceSubType),
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
        onClick={(e) => {
          e.stopPropagation();
          onDownload(resource);
        }}
      >
        <Download className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(resource);
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  const filterComponent = (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        JavaScript type
      </label>
      <Select
        value={resourceSubTypeFilter || "ALL"}
        onValueChange={(value) =>
          onResourceSubTypeChange(value === "ALL" ? undefined : value)
        }
        options={[
          { value: "ALL", label: "All" },
          { value: "EXTENSION", label: "Extension" },
          { value: "MODULE", label: "Module" },
        ]}
        placeholder="All"
        className="w-[180px]"
      />
    </div>
  );

  return (
    <DataTable
      title="JavaScript library"
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
      emptyMessage="No JavaScript resources found."
      loadingMessage="Loading JavaScript resources..."
    />
  );
};
