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
import type { Asset } from "@/types/thingsboardAssetTypes";

interface EntitiesAssetsTableProps {
  assets: Asset[];
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
  onRowClick?: (asset: Asset) => void;
  onMakePublic?: (asset: Asset) => Promise<void>;
  onMakePrivate?: (asset: Asset) => Promise<void>;
  onDelete?: (asset: Asset) => Promise<void>;
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

export const EntitiesAssetsTable = ({
  assets,
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
}: EntitiesAssetsTableProps) => {
  const [loadingAssetId, setLoadingAssetId] = useState<string | null>(null);

  const runAction = useCallback(
    async (asset: Asset, action: (a: Asset) => Promise<void>) => {
      const id = asset.id?.id ?? "";
      setLoadingAssetId(id);
      try {
        await action(asset);
      } finally {
        setLoadingAssetId(null);
      }
    },
    [],
  );

  const columns: DataTableColumn<Asset>[] = [
    {
      key: "createdTime",
      header: "Created time",
      sortable: true,
      render: (asset) => formatDate(asset.createdTime),
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "font-medium text-primary",
    },
    {
      key: "assetProfileName",
      header: "Asset profile",
      sortable: true,
      render: (asset) => asset.assetProfileName || "-",
    },
    {
      key: "label",
      header: "Label",
      sortable: true,
      render: (asset) => asset.label ?? "-",
    },
    {
      key: "customerTitle",
      header: "Customer",
      sortable: true,
      render: (asset) => asset.customerTitle ?? "-",
    },
    {
      key: "customerIsPublic",
      header: "Public",
      sortable: false,
      render: (asset) => (
        <Checkbox
          checked={asset.customerIsPublic}
          disabled
          className="cursor-default"
        />
      ),
    },
  ];

  const rowActions = (asset: Asset) => {
    const id = asset.id?.id ?? "";
    const isThisLoading = loadingAssetId === id;

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
                if (onMakePublic) runAction(asset, onMakePublic);
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
              disabled={isThisLoading}
              onClick={(event) => {
                event.stopPropagation();
                if (onMakePrivate) runAction(asset, onMakePrivate);
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
                if (onDelete) runAction(asset, onDelete);
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
      title="Assets"
      data={assets}
      columns={columns}
      getRowId={(asset) => asset.id?.id ?? ""}
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
      addButtonLabel="Add Asset"
      emptyMessage="No assets found."
      loadingMessage="Loading assets..."
    />
  );
};
