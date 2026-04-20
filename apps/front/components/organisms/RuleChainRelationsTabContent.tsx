"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { RuleChainService } from "@/lib/services/thingsboardServices/ruleChainService";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AddRelationDialog } from "./AddRelationDialog";

interface RuleChainRelationsTabContentProps {
  ruleChainId: string;
}

export function RuleChainRelationsTabContent({
  ruleChainId,
}: RuleChainRelationsTabContentProps) {
  const [direction, setDirection] = useState<"FROM" | "TO">("FROM");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const {
    data: relations,
    isLoading,
    mutate,
  } = useSWR(
    ruleChainId ? ["ruleChainRelations", ruleChainId, direction] : null,
    async () => {
      // Note: we can filter relations by direction in a generic way or use proxy logic
      // For now, getRuleChainRelations returns info for the rule chain
      const res = await RuleChainService.getRuleChainRelations(ruleChainId);
      
      // Filter by direction if needed, or if API supports it, use it.
      // ThingsBoard's /relations/info?fromId=... returns outgoing relations by default.
      // If direction is TO, we might need a different query or manual filtering.
      return res;
    },
  );

  const columns: DataTableColumn<any>[] = useMemo(
    () => [
      {
        key: "type",
        header: "Link type",
      },
      {
        key: "fromOrTo",
        header: direction === "FROM" ? "To Entity" : "From Entity",
        render: (relation) => {
          const entity = direction === "FROM" ? relation.to : relation.from;
          const name = direction === "FROM" ? relation.toName : relation.fromName;

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
          const relatedEntity = direction === "FROM" ? relation.to : relation.from;
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
                  await RuleChainService.deleteRuleChainRelation(ruleChainId, {
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
    [deletingKey, direction, ruleChainId, mutate],
  );

  const filteredRelations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return relations || [];
    }

    return (relations || []).filter((relation: any) => {
      const entity = direction === "FROM" ? relation.to : relation.from;
      const entityName = String(direction === "FROM" ? relation.toName || "" : relation.fromName || "").toLowerCase();
      const entityType = String(entity?.entityType || "").toLowerCase();
      const relationType = String(relation.type || "").toLowerCase();

      return (
        entityName.includes(query) ||
        entityType.includes(query) ||
        relationType.includes(query)
      );
    });
  }, [relations, searchQuery, direction]);

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
          Outgoing (From Rule Chain)
        </button>
        <button
          onClick={() => setDirection("TO")}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            direction === "TO"
              ? "bg-primary text-primary-foreground"
              : "bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Incoming (To Rule Chain)
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
            : `No relations found for this rule chain.`
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
          // Construct the payload for TB generic relation API
          const payload = {
            type: params.relationType,
            typeGroup: "COMMON",
            additionalInfo: null,
            from: params.direction === "FROM" 
              ? { entityType: "RULE_CHAIN", id: ruleChainId }
              : { entityType: params.relatedEntityType, id: params.relatedEntityId },
            to: params.direction === "FROM"
              ? { entityType: params.relatedEntityType, id: params.relatedEntityId }
              : { entityType: "RULE_CHAIN", id: ruleChainId }
          };

          await RuleChainService.saveRuleChainRelation(ruleChainId, payload);
          mutate();
        }}
      />
    </div>
  );
}
