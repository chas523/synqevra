"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { AssetService } from "@/lib/services/thingsboardServices/assetService";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddRelationDialog } from "./AddRelationDialog";

interface AssetRelationsTabContentProps {
  assetId: string;
}

export function AssetRelationsTabContent({
  assetId,
}: AssetRelationsTabContentProps) {
  const [direction, setDirection] = useState<"FROM" | "TO">("FROM");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

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
      {
        key: "actions",
        header: "",
        render: (relation) => {
          const relatedEntity =
            direction === "FROM" ? relation.to : relation.from;
          const key = `${relation.from?.id}-${relation.to?.id}-${relation.type}`;
          const isDeleting = deletingKey === key;

          return (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-red-500"
              disabled={isDeleting}
              onClick={async (e) => {
                e.stopPropagation();
                setDeletingKey(key);
                try {
                  await AssetService.deleteAssetRelation(assetId, {
                    relatedEntityId: relatedEntity.id,
                    relatedEntityType: relatedEntity.entityType,
                    relationType: relation.type,
                    direction,
                  });
                  toast.success("Relation deleted");
                  mutate();
                } catch {
                  toast.error("Failed to delete relation");
                } finally {
                  setDeletingKey(null);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          );
        },
      },
    ],
    [deletingKey, direction, assetId, mutate],
  );

  const filteredRelations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return relations || [];
    }

    return (relations || []).filter((relation) => {
      const entity = direction === "FROM" ? relation.to : relation.from;
      const entityName = String(
        direction === "FROM" ? relation.toName || "" : relation.fromName || "",
      ).toLowerCase();
      const entityType = String(entity?.entityType || "").toLowerCase();
      const relationType = String(relation.type || "").toLowerCase();
      const relationTypeGroup = String(relation.typeGroup || "").toLowerCase();

      return (
        entityName.includes(query) ||
        entityType.includes(query) ||
        relationType.includes(query) ||
        relationTypeGroup.includes(query)
      );
    });
  }, [direction, relations, searchQuery]);

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
        data={filteredRelations}
        columns={columns}
        getRowId={(row) => `${row.from.id}-${row.to.id}-${row.type}`}
        isLoading={isLoading}
        onRefresh={() => mutate()}
        filterComponent={
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="w-full sm:w-64">
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search relations..."
              />
            </div>
          </div>
        }
        customAction={
          <Button
            type="button"
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => setDialogOpen(true)}
          >
            Add relation
          </Button>
        }
        emptyMessage={
          searchQuery.trim()
            ? "No relations match your search."
            : "No relations found for this asset."
        }
        loadingMessage="Loading relations..."
        currentPage={0}
        pageSize={filteredRelations.length || 10}
        totalPages={1}
        totalElements={filteredRelations.length}
        onPageChange={() => {}}
      />

      <AddRelationDialog
        open={dialogOpen}
        direction={direction}
        onClose={() => setDialogOpen(false)}
        onSave={async (params) => {
          await AssetService.saveAssetRelation(assetId, params);
          mutate();
        }}
      />
    </div>
  );
}
