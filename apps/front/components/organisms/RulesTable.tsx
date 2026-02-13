"use client";

import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import type { NotificationRule } from "@/lib/types/dashboardTypes";
import { Check, X } from "lucide-react";

interface RulesTableProps {
    rules: NotificationRule[];
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
    onRowClick?: (rule: NotificationRule) => void;
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

export const RulesTable = ({
    rules,
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
}: RulesTableProps) => {
    const columns: DataTableColumn<NotificationRule>[] = [
        {
            key: "createdTime",
            header: "Created time",
            sortable: true,
            render: (rule) => formatDate(rule.createdTime),
        },
        {
            key: "name",
            header: "Name",
            sortable: true,
            className: "font-medium",
        },
        {
            key: "triggerType",
            header: "Trigger Type",
            sortable: true,
            render: (rule) => rule.triggerType || "-",
        },
        {
            key: "templateName",
            header: "Template",
            sortable: false, // templateName might not be sortable in API directly usually
            render: (rule) => rule.templateName || "-",
        },
        {
            key: "enabled",
            header: "Enabled",
            sortable: false,
            render: (rule) => (
                <div className="flex items-center">
                    {rule.enabled ? (
                        <Check className="h-4 w-4 text-green-500" />
                    ) : (
                        <X className="h-4 w-4 text-red-500" />
                    )}
                </div>
            ),
        },
    ];

    return (
        <DataTable
            title="Notification Rules"
            data={rules}
            columns={columns}
            getRowId={(rule) => rule.id?.id || String(Math.random())}
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
            emptyMessage="No notification rules found."
            loadingMessage="Loading notification rules..."
        />
    );
};
