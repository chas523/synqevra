"use client";

import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import type { NotificationTarget } from "@/lib/types/dashboardTypes";

interface RecipientsTableProps {
    targets: NotificationTarget[];
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
    onRowClick?: (target: NotificationTarget) => void;
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

export const RecipientsTable = ({
    targets,
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
}: RecipientsTableProps) => {
    const columns: DataTableColumn<NotificationTarget>[] = [
        {
            key: "createdTime",
            header: "Created time",
            sortable: true,
            render: (target) => formatDate(target.createdTime),
        },
        {
            key: "name",
            header: "Recipient group",
            sortable: true,
            className: "font-medium",
        },
        {
            key: "type",
            header: "Type",
            sortable: false,
            render: (target) => target.configuration?.type || "-",
        },
        {
            key: "description",
            header: "Description",
            sortable: false,
            render: (target) => target.configuration?.description || "",
        },
    ];

    return (
        <DataTable
            title="Recipient Groups"
            data={targets}
            columns={columns}
            getRowId={(target) => target.id?.id || String(Math.random())}
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
            emptyMessage="No recipient groups found."
            loadingMessage="Loading recipient groups..."
        />
    );
};
