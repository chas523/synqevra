"use client";

import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import { Queue } from "@/types/queueTypes";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface QueuesTableProps {
    queues: Queue[];
    isLoading: boolean;
    // Pagination
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    // Sorting
    sortProperty: string;
    sortOrder: "ASC" | "DESC";
    onSortChange: (property: string, order: "ASC" | "DESC") => void;
    // Actions
    onRefresh: () => void;
    onAdd: () => void;
    onEdit: (queue: Queue) => void;
    onDelete: (queueId: string) => void;
}

const getStrategyLabel = (type: string) => {
    return type
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase());
};

export const QueuesTable = ({
    queues,
    isLoading,
    currentPage,
    totalPages,
    totalElements,
    pageSize,
    onPageChange,
    sortProperty,
    sortOrder,
    onSortChange,
    onRefresh,
    onAdd,
    onEdit,
    onDelete,
}: QueuesTableProps) => {
    const columns: DataTableColumn<Queue>[] = [
        {
            key: "name",
            header: "Name",
            sortable: true,
            className: "font-medium",
        },
        {
            key: "partitions",
            header: "Partitions",
            sortable: true,
        },
        {
            key: "submitStrategy",
            header: "Submit strategy",
            sortable: false,
            render: (queue) => getStrategyLabel(queue.submitStrategy.type),
        },
        {
            key: "processingStrategy",
            header: "Processing strategy",
            sortable: false,
            render: (queue) => getStrategyLabel(queue.processingStrategy.type),
        },
    ];

    const rowActions = (queue: Queue) => (
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => queue.id?.id && onDelete(queue.id.id)}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    );

    return (
        <DataTable
            title="Queues"
            data={queues}
            columns={columns}
            getRowId={(queue) => queue.id?.id || ""}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={onPageChange}
            sortProperty={sortProperty}
            sortOrder={sortOrder}
            onSortChange={onSortChange}
            onAdd={onAdd}
            onRefresh={onRefresh}
            onRowClick={onEdit}
            rowActions={rowActions}
            emptyMessage="No queues found."
            loadingMessage="Loading queues..."
        />
    );
};
