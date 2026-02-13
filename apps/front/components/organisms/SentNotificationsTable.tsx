"use client";

import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import { Badge } from "@/components/ui/badge";
import type { NotificationRequest } from "@/lib/types/dashboardTypes";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface SentNotificationsTableProps {
    requests: NotificationRequest[];
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
    onRowClick?: (request: NotificationRequest) => void;
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

const getStatusBadge = (status?: string) => {
    if (!status) return null;

    const statusLower = status.toLowerCase();
    if (statusLower === "sent" || statusLower === "processing") {
        return (
            <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                {status}
            </Badge>
        );
    }
    if (statusLower === "error" || statusLower === "failed") {
        return (
            <Badge variant="outline" className="gap-1">
                <XCircle className="h-3 w-3 text-red-500" />
                {status}
            </Badge>
        );
    }
    return (
        <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {status}
        </Badge>
    );
};

export const SentNotificationsTable = ({
    requests,
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
}: SentNotificationsTableProps) => {
    const columns: DataTableColumn<NotificationRequest>[] = [
        {
            key: "createdTime",
            header: "Created time",
            sortable: true,
            render: (request) => formatDate(request.createdTime),
        },
        {
            key: "template",
            header: "Template",
            sortable: false,
            className: "font-medium",
            render: (request) => {
                // Handle both string and object template formats
                if (!request.template) return "-";
                if (typeof request.template === 'string') return request.template;
                if (typeof request.template === 'object' && 'name' in request.template) {
                    return request.template.name || "-";
                }
                return "-";
            },
        },
        {
            key: "targets",
            header: "Recipients",
            sortable: false,
            render: (request) => {
                // Handle targets which might be an object with keys like {WEB: [...]}
                if (!request.targets) return "0 recipients";

                // If targets is an object (like {WEB: [...]}), get all values
                if (typeof request.targets === 'object' && !Array.isArray(request.targets)) {
                    const allTargets = Object.values(request.targets).flat();
                    const count = allTargets.length;
                    return `${count} recipient${count !== 1 ? 's' : ''}`;
                }

                // If targets is an array
                if (Array.isArray(request.targets)) {
                    const count = request.targets.length;
                    return `${count} recipient${count !== 1 ? 's' : ''}`;
                }

                return "0 recipients";
            },
        },
        {
            key: "stats",
            header: "Delivery Stats",
            sortable: false,
            render: (request) => {
                // Stats can have sent/errors as objects like {WEB: 7}
                let sent = 0;
                let errors = 0;

                // Handle sent stats - can be object {WEB: 7} or number
                if (request.stats?.sent) {
                    if (typeof request.stats.sent === 'object') {
                        sent = Object.values(request.stats.sent as Record<string, number>).reduce((sum, val) => sum + val, 0);
                    } else {
                        sent = request.stats.sent;
                    }
                }

                // Handle error stats - can be object {WEB: 2} or number
                if (request.stats?.errors) {
                    if (typeof request.stats.errors === 'object') {
                        errors = Object.values(request.stats.errors as Record<string, number>).reduce((sum, val) => sum + val, 0);
                    } else {
                        errors = request.stats.errors as number;
                    }
                }

                // Also check totalErrors field
                if (request.stats?.totalErrors) {
                    errors = request.stats.totalErrors;
                }

                const total = sent + errors;

                return (
                    <div className="flex gap-2">
                        <span className="text-green-600 dark:text-green-400">✓ {sent}</span>
                        {errors > 0 && (
                            <span className="text-red-600 dark:text-red-400">✗ {errors}</span>
                        )}
                        <span className="text-muted-foreground">/ {total}</span>
                    </div>
                );
            },
        },
        {
            key: "status",
            header: "Status",
            sortable: false,
            render: (request) => {
                // Safely handle status which might be undefined
                const status = request.status;
                if (!status || typeof status !== 'string') return "-";
                return getStatusBadge(status);
            },
        },
    ];

    return (
        <DataTable
            title="Sent Notifications"
            data={requests}
            columns={columns}
            getRowId={(request) => {
                // Safely extract ID
                if (!request.id || typeof request.id !== 'object') return String(Math.random());
                return request.id.id || String(Math.random());
            }}
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
            emptyMessage="No sent notifications found."
            loadingMessage="Loading sent notifications..."
        />
    );
};
