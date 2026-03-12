"use client";

import { useState, useCallback } from "react";
import { RulesTable } from "@/components/organisms/RulesTable";
import { useNotificationRules } from "@/hooks/dashboard/useNotificationRules";
import type { NotificationRule } from "@/lib/types/dashboardTypes";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddRuleDialog } from "@/components/organisms/AddRuleDialog";

const PAGE_SIZE = 10;

export default function RulesPage() {
  const [currentPage, setCurrentPage] = useState(0);
  const [sortProperty, setSortProperty] = useState("createdTime");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);

  const { rules, totalPages, totalElements, isLoading, mutate } =
    useNotificationRules({
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

  const handleRowClick = useCallback((rule: NotificationRule) => {
    console.log("Clicked rule:", rule);
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notification Rules</h1>
        <Button onClick={() => setIsAddRuleOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Rule
        </Button>
      </div>
      <RulesTable
        rules={rules}
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
      <AddRuleDialog
        open={isAddRuleOpen}
        onOpenChange={setIsAddRuleOpen}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
