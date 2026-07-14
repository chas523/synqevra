"use client";

import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import { WidgetBundle } from "@/types/widgetTypes";
import { useRouter } from "next/navigation";

interface WidgetBundlesTableProps {
  widgetBundles: WidgetBundle[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  // Sorting
  sortProperty: string;
  sortOrder: "ASC" | "DESC";
  onSortChange: (property: string, order: "ASC" | "DESC") => void;
  // Actions
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onRowClick?: (widgetBundle: WidgetBundle) => void;
  customAction?: React.ReactNode;
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

export const WidgetBundlesTable = ({
  widgetBundles,
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
  customAction,
}: WidgetBundlesTableProps) => {
  const router = useRouter();
  const columns: DataTableColumn<WidgetBundle>[] = [
    {
      key: "createdTime",
      header: "Created time",
      sortable: true,
      render: (bundle) => formatDate(bundle.createdTime),
    },
    {
      key: "title",
      header: "Title",
      sortable: true,
      className: "font-medium text-primary",
    },
    {
      key: "description",
      header: "Description",
      sortable: false,
    },
  ];

  return (
    <DataTable
      title="Widget Bundles"
      data={widgetBundles}
      columns={columns}
      getRowId={(bundle) => bundle.id.id}
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
      customAction={customAction}
      emptyMessage="No widget bundles found."
      loadingMessage="Loading widget bundles..."
    />
  );
};
