"use client";

import { useState, useCallback } from "react";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import {
  useVersions,
  useEntityVersions,
  useBranches,
} from "@/hooks/thingsboard/version-control/useVersionControl";
import { VersionEntry } from "@/types/versionControlTypes";
import { Button } from "@/components/ui/button";
import { Copy, Clock, RefreshCw, X, Link2Off, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Select from "@/components/ui/select";
import { CreateVersionModal } from "./CreateVersionModal";
import { RestoreVersionModal } from "./RestoreVersionModal";

const PAGE_SIZE = 10;

interface VersionsTableProps {
  branch: string;
  onBranchChange: (branch: string) => void;
  onUnlink?: () => void;
  entityType?: string;
  entityId?: string;
  isReadOnly?: boolean;
}

export function VersionsTable({
  branch,
  onBranchChange,
  onUnlink,
  entityType,
  entityId,
  isReadOnly = false,
}: VersionsTableProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortProperty, setSortProperty] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Restore modal state
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { branches, isLoading: isLoadingBranches } = useBranches(true);

  const generalVersions = useVersions(
    currentPage,
    PAGE_SIZE,
    sortProperty,
    sortOrder,
    branch,
    !entityType || !entityId,
  );

  const entityVersions = useEntityVersions(
    entityType || "",
    entityId || "",
    currentPage,
    PAGE_SIZE,
    sortProperty,
    sortOrder,
    branch,
    !!(entityType && entityId),
  );

  const { versions, totalPages, totalElements, isLoading, mutate } =
    entityType && entityId ? entityVersions : generalVersions;

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSortChange = useCallback(
    (property: string, order: "ASC" | "DESC") => {
      setSortProperty(property);
      setSortOrder(order);
      setCurrentPage(0);
    },
    [],
  );

  const handleCopyId = useCallback((id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Version ID copied to clipboard");
  }, []);

  const branchOptions = branches.map((b) => ({
    value: b.name,
    label: b.name,
    description: b.default ? "Default branch" : undefined,
  }));

  const columns: DataTableColumn<VersionEntry>[] = [
    {
      key: "timestamp",
      header: "Created time",
      sortable: true,
      render: (entry) => (
        <span className="dark:text-white text-sm">
          {new Date(entry.timestamp).toLocaleString()}
        </span>
      ),
    },
    {
      key: "id",
      header: "Version ID",
      render: (entry) => (
        <div className="flex items-center gap-1">
          <span className="dark:text-white text-sm font-mono">
            {entry.id.substring(0, 7)}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCopyId(entry.id);
            }}
            className="text-muted-foreground hover:text-foreground"
            title="Copy version ID"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
    {
      key: "name",
      header: "Version name",
      render: (entry) => (
        <span className="dark:text-white text-sm">{entry.name.trim()}</span>
      ),
    },
    {
      key: "author",
      header: "Author",
      render: (entry) => (
        <span className="dark:text-white text-sm">{entry.author}</span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <DataTable
        title="Versions"
        data={versions}
        columns={columns}
        getRowId={(entry) => entry.id}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
        sortProperty={sortProperty}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onRefresh={() => mutate()}
        rowActions={(entry) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setVersionToRestore({ id: entry.id, name: entry.name });
              setIsRestoreModalOpen(true);
            }}
            title="Restore version"
            className="text-muted-foreground"
            disabled={isReadOnly}
          >
            <Clock className="h-4 w-4" />
          </Button>
        )}
        customAction={
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-block">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCreateModalOpen(true)}
                      className="border rounded-lg"
                      disabled={isReadOnly}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Create entities version
                    </Button>
                  </div>
                </TooltipTrigger>
                {isReadOnly && (
                  <TooltipContent>
                    <p>Repository is read only</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>

            {onUnlink && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onUnlink}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <Link2Off className="h-4 w-4 mr-2" />
                Unlink
              </Button>
            )}
          </div>
        }
        filterComponent={
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground dark:text-slate-400 font-medium ml-1 mb-0.5">
                Branch
              </span>
              <Select
                options={branchOptions}
                value={branch}
                onValueChange={onBranchChange}
                placeholder="Select branch"
                className="w-48"
                disabled={isLoadingBranches}
              />
            </div>
          </div>
        }
        emptyMessage="No versions found."
      />

      <CreateVersionModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        branches={branches}
        onSuccess={() => {
          mutate();
          if (entityType && entityId) {
            entityVersions.mutate();
          }
        }}
      />

      {versionToRestore && (
        <RestoreVersionModal
          open={isRestoreModalOpen}
          onOpenChange={setIsRestoreModalOpen}
          versionId={versionToRestore.id}
          versionName={versionToRestore.name}
          onSuccess={() => mutate()}
        />
      )}
    </div>
  );
}
