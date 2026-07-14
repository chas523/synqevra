"use client";

import { useState, useCallback } from "react";
import { TemplatesTable } from "@/components/organisms/TemplatesTable";
import { useNotificationTemplates } from "@/hooks/dashboard/useNotificationTemplates";
import type { NotificationTemplate } from "@/lib/types/dashboardTypes";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateTemplateDialog } from "@/components/organisms/CreateTemplateDialog";

const PAGE_SIZE = 10;

export default function TemplatesPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortProperty, setSortProperty] = useState("createdTime");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { templates, totalPages, totalElements, isLoading, mutate } =
    useNotificationTemplates({
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

  const handleRowClick = useCallback((template: NotificationTemplate) => {
    console.log("Clicked template:", template);
  }, []);

  return (
    <div className="container mx-auto space-y-4">
      <div className="flex justify-end pt-4">
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <TemplatesTable
        templates={templates}
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

      <CreateTemplateDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
