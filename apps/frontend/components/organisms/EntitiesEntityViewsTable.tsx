"use client";

import { useCallback, useState } from "react";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Globe, Loader2, Lock, Trash2 } from "lucide-react";
import type { EntityView } from "@/types/thingsboardEntityViewTypes";

interface EntitiesEntityViewsTableProps {
  entityViews: EntityView[];
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
  onAdd: () => void;
  onRowClick?: (entityView: EntityView) => void;
  onMakePublic?: (entityView: EntityView) => Promise<void>;
  onMakePrivate?: (entityView: EntityView) => Promise<void>;
  onDelete?: (entityView: EntityView) => Promise<void>;
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

export const EntitiesEntityViewsTable = ({
  entityViews,
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
  onRowClick,
  onMakePublic,
  onMakePrivate,
  onDelete,
}: EntitiesEntityViewsTableProps) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const runAction = useCallback(
    async (
      entityView: EntityView,
      action: (ev: EntityView) => Promise<void>,
    ) => {
      const id = entityView.id?.id ?? "";
      setLoadingId(id);
      try {
        await action(entityView);
      } finally {
        setLoadingId(null);
      }
    },
    [],
  );

  const columns: DataTableColumn<EntityView>[] = [
    {
      key: "createdTime",
      header: "Created time",
      sortable: true,
      render: (entityView) => formatDate(entityView.createdTime),
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "font-medium text-primary",
    },
    {
      key: "type",
      header: "Type",
      sortable: true,
      render: (entityView) => entityView.type || "-",
    },
    {
      key: "entityType",
      header: "Entity type",
      sortable: false,
      render: (entityView) => entityView.entityId?.entityType || "-",
    },
    {
      key: "customerTitle",
      header: "Customer",
      sortable: true,
      render: (entityView) => entityView.customerTitle ?? "-",
    },
    {
      key: "customerIsPublic",
      header: "Public",
      sortable: false,
      render: (entityView) => (
        <Checkbox
          checked={Boolean(entityView.customerIsPublic)}
          disabled
          className="cursor-default"
        />
      ),
    },
  ];

  const rowActions = (entityView: EntityView) => {
    const id = entityView.id?.id ?? "";
    const isThisLoading = loadingId === id;
    const isPublic = Boolean(entityView.customerIsPublic);

    return (
      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-blue-500"
              disabled={isThisLoading || isPublic}
              onClick={(event) => {
                event.stopPropagation();
                if (onMakePublic) runAction(entityView, onMakePublic);
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

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-slate-700"
              disabled={isThisLoading || !isPublic}
              onClick={(event) => {
                event.stopPropagation();
                if (onMakePrivate) runAction(entityView, onMakePrivate);
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
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              disabled={isThisLoading}
              onClick={(event) => {
                event.stopPropagation();
                if (onDelete) runAction(entityView, onDelete);
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
      title="Entity Views"
      data={entityViews}
      columns={columns}
      getRowId={(entityView) => entityView.id?.id ?? ""}
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
      onRowClick={onRowClick}
      rowActions={rowActions}
      addButtonLabel="Add Entity View"
      emptyMessage="No entity views found."
      loadingMessage="Loading entity views..."
    />
  );
};
