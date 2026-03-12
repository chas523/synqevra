"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { AssetService } from "@/lib/services/thingsboardServices/assetService";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import { Loader2 } from "lucide-react";

interface AssetRelationsTabContentProps {
  assetId: string;
}

export function AssetRelationsTabContent({
  assetId,
}: AssetRelationsTabContentProps) {
  const [direction, setDirection] = useState<"FROM" | "TO">("FROM");

  const {
    data: relations,
    isLoading,
    mutate,
  } = useSWR(
    assetId ? ["assetRelations", assetId, direction] : null,
    async () => {
      return AssetService.getAssetRelations(assetId, direction);
    },
  );

  const columns: DataTableColumn<any>[] = useMemo(
    () => [
      {
        key: "type",
        header: "Type",
      },
      {
        key: "fromOrTo",
        header: direction === "FROM" ? "To Entity" : "From Entity",
        render: (relation) => {
          const entity = direction === "FROM" ? relation.to : relation.from;
          const name =
            direction === "FROM" ? relation.toName : relation.fromName;

          return (
            <div className="flex flex-col">
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {name || entity.id}
              </span>
              <span className="text-xs text-slate-500">
                {entity.entityType}
              </span>
            </div>
          );
        },
      },
      {
        key: "typeGroup",
        header: "Type Group",
      },
    ],
    [direction],
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setDirection("FROM")}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            direction === "FROM"
              ? "bg-primary text-primary-foreground"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Outgoing (From asset)
        </button>
        <button
          onClick={() => setDirection("TO")}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            direction === "TO"
              ? "bg-primary text-primary-foreground"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Incoming (To asset)
        </button>
      </div>

      <DataTable
        title="Relations"
        data={relations || []}
        columns={columns}
        getRowId={(row) => `${row.from.id}-${row.to.id}-${row.type}`}
        isLoading={isLoading}
        onRefresh={() => mutate()}
        emptyMessage="No relations found for this asset."
        loadingMessage="Loading relations..."
        currentPage={0}
        pageSize={relations?.length || 10}
        totalPages={1}
        totalElements={relations?.length || 0}
        onPageChange={() => {}}
      />
    </div>
  );
}
