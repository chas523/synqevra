"use client";

import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import type { NotificationTemplate } from "@/lib/types/dashboardTypes";

interface TemplatesTableProps {
  templates: NotificationTemplate[];
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
  onRowClick?: (template: NotificationTemplate) => void;
}

const formatDate = (timestamp?: number) => {
  if (!timestamp) return "-";
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const TemplatesTable = ({
  templates,
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
  onRowClick,
}: TemplatesTableProps) => {
  const columns: DataTableColumn<NotificationTemplate>[] = [
    {
      key: "createdTime",
      header: "Created time",
      sortable: true,
      render: (template) => formatDate(template.createdTime),
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      className: "font-medium",
    },
    {
      key: "notificationType",
      header: "Notification Type",
      sortable: true,
      render: (template) => template.notificationType || "-",
    },
    {
      key: "deliveryMethods",
      header: "Delivery Methods",
      sortable: false,
      render: (template) => {
        const methods = template.configuration?.deliveryMethodsTemplates;
        if (!methods) return "-";
        // Show only enabled methods
        const enabledMethods = Object.values(methods)
          .filter((m: any) => m.enabled)
          .map((m: any) => m.method);

        return enabledMethods.length > 0 ? enabledMethods.join(", ") : "-";
      },
    },
  ];

  return (
    <DataTable
      title="Notification Templates"
      data={templates}
      columns={columns}
      getRowId={(template) => template.id?.id || String(Math.random())}
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
      onRowClick={onRowClick}
      emptyMessage="No notification templates found."
      loadingMessage="Loading notification templates..."
    />
  );
};
