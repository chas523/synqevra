"use client";

import { useState, useCallback } from "react";
import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import { RuleChain } from "@/lib/services/thingsboardServices/ruleChainService";
import {
  useRuleChains,
  useManageRuleChain,
} from "@/hooks/thingsboard/rule-chains/useRuleChains";
import { AddRuleChainModal } from "@/components/organisms/AddRuleChainModal";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Flag, Trash2, CheckSquare, Square } from "lucide-react";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 10;

export default function RuleChainsPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [sortProperty, setSortProperty] = useState("createdTime");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [showAddModal, setShowAddModal] = useState(false);

  const { ruleChains, totalPages, totalElements, isLoading, mutate } =
    useRuleChains(currentPage, PAGE_SIZE, sortProperty, sortOrder, "CORE");

  const { isSaving, createRuleChain, setRootRuleChain, deleteRuleChain } =
    useManageRuleChain();

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

  const handleRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  const handleRowClick = useCallback(
    (rc: RuleChain) => {
      router.push(`/rulechains/${rc.id.id}`);
    },
    [router],
  );

  const handleAdd = useCallback(
    async (payload: any) => {
      try {
        await createRuleChain(payload);
        toast.success("Rule chain added successfully");
        mutate();
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to add rule chain";
        toast.error(errorMessage);
        throw error;
      }
    },
    [createRuleChain, mutate],
  );

  const handleSetRoot = useCallback(
    async (rc: RuleChain) => {
      try {
        if (!rc.id?.id) {
          toast.error("Rule chain ID not found");
          return;
        }
        await setRootRuleChain(rc.id.id);
        toast.success("Rule chain set as root successfully");
        mutate();
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to set rule chain as root";
        toast.error(errorMessage);
      }
    },
    [setRootRuleChain, mutate],
  );

  const handleDelete = useCallback(
    async (rc: RuleChain) => {
      try {
        if (!rc.id?.id) {
          toast.error("Rule chain ID not found");
          return;
        }
        await deleteRuleChain(rc.id.id);
        toast.success("Rule chain deleted successfully");
        mutate();
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to delete rule chain";
        toast.error(errorMessage);
      }
    },
    [deleteRuleChain, mutate],
  );

  const columns: DataTableColumn<RuleChain>[] = [
    {
      key: "createdTime",
      header: "Created time",
      sortable: true,
      render: (rc) => (
        <span className="dark:text-white">
          {new Date(rc.createdTime).toLocaleString()}
        </span>
      ),
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (rc) => (
        <span className="dark:text-white font-medium">{rc.name}</span>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (rc) => (
        <span className="dark:text-gray-300">
          {rc.additionalInfo?.description || ""}
        </span>
      ),
    },
    {
      key: "root",
      header: "Root",
      render: (rc) => (
        <div className="flex items-center text-muted-foreground">
          {rc.root ? (
            <CheckSquare className="h-4 w-4 text-primary dark:text-blue-400" />
          ) : (
            <Square className="h-4 w-4 dark:text-gray-400" />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <DataTable
        title="Rule chains"
        data={ruleChains}
        columns={columns}
        getRowId={(rc) => rc.id.id}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
        sortProperty={sortProperty}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onAdd={() => setShowAddModal(true)}
        onRefresh={handleRefresh}
        onRowClick={handleRowClick}
        rowActions={(rc) => (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleSetRoot(rc);
              }}
              title="Set as root rule chain"
              disabled={rc.root}
              className={
                rc.root
                  ? "opacity-30 cursor-not-allowed"
                  : "text-muted-foreground hover:text-primary"
              }
            >
              <Flag className="h-4 w-4 dark:text-gray-300" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(rc);
              }}
              title="Delete rule chain"
              disabled={rc.root}
              className={
                rc.root
                  ? "opacity-30 cursor-not-allowed"
                  : "text-muted-foreground hover:text-destructive"
              }
            >
              <Trash2 className="h-4 w-4 dark:text-gray-300" />
            </Button>
          </div>
        )}
        emptyMessage="No rule chains found."
      />

      <AddRuleChainModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAdd}
        isSaving={isSaving}
      />
    </div>
  );
}
