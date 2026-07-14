"use client";

import { useState, useCallback } from "react";
import { RecipientsTable } from "@/components/organisms/RecipientsTable";
import { useNotificationTargets } from "@/hooks/dashboard/useNotificationTargets";
import type { NotificationTarget } from "@/lib/types/dashboardTypes";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateRecipientGroupDialog } from "@/components/organisms/CreateRecipientGroupDialog";

const PAGE_SIZE = 10;

export default function RecipientsPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortProperty, setSortProperty] = useState("createdTime");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { targets, totalPages, totalElements, isLoading, mutate } =
    useNotificationTargets({
      page: currentPage,
      pageSize: PAGE_SIZE,
      sortProperty,
      sortOrder,
    });

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

  const handleRowClick = useCallback((target: NotificationTarget) => {
    console.log("Clicked target:", target);
  }, []);

  const handleCreateSuccess = useCallback(() => {
    mutate();
    setShowCreateDialog(false);
  }, [mutate]);

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Recipient Groups</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add recipient group
        </Button>
      </div>

      <RecipientsTable
        targets={targets}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={PAGE_SIZE}
        sortProperty={sortProperty}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onPageChange={handlePageChange}
        onRefresh={handleRefresh}
        onRowClick={handleRowClick}
      />

      <CreateRecipientGroupDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
