"use client";

import { DataTable, DataTableColumn } from "@/components/molecules/DataTable";
import { Button } from "@/components/ui/button";
import Select from "@/components/ui/select";
import { WidgetType } from "@/types/widgetTypes";
import { Trash2, Download } from "lucide-react";
import { WidgetService } from "@/lib/services/thingsboardServices/widgetService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface WidgetTypesTableProps {
    widgetTypes: WidgetType[];
    isLoading: boolean;
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
    deprecatedFilter: string;
    // Sorting
    sortProperty: string;
    sortOrder: "ASC" | "DESC";
    onSortChange: (property: string, order: "ASC" | "DESC") => void;
    // Actions
    onPageChange: (page: number) => void;
    onDeprecatedFilterChange: (filter: string) => void;
    onRefresh: () => void;
    onAdd: () => void;
    onRowClick: (widgetType: WidgetType) => void;
    onDelete: (widgetType: WidgetType) => void;
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

export const WidgetTypesTable = ({
    widgetTypes,
    isLoading,
    currentPage,
    totalPages,
    totalElements,
    pageSize,
    deprecatedFilter,
    sortProperty,
    sortOrder,
    onSortChange,
    onPageChange,
    onDeprecatedFilterChange,
    onRefresh,
    onAdd,
    onRowClick,
    onDelete,
    customAction,
}: WidgetTypesTableProps) => {
    const router = useRouter();
    const columns: DataTableColumn<WidgetType>[] = [
        {
            key: "createdTime",
            header: "Created time",
            sortable: true,
            render: (widgetType) => formatDate(widgetType.createdTime),
        },
        {
            key: "name",
            header: "Name",
            sortable: true,
            className: "font-medium text-primary",
        },
        {
            key: "bundles",
            header: "Widget Bundle",
            sortable: true,
            render: (widgetType) => (
                <div className="flex flex-wrap gap-1">
                    {widgetType.bundles?.length > 0 ? (
                        widgetType.bundles.map((b) => (
                            <Badge
                                key={b.id.id}
                                variant="secondary"
                                className="cursor-pointer hover:bg-primary/80"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/resources/widgets-library/widgets-bundles/${b.id.id}`);
                                }}
                            >
                                {b.name}
                            </Badge>
                        ))
                    ) : (
                        "-"
                    )}
                </div>
            ),
        },
        {
            key: "deprecated",
            header: "Deprecated",
            sortable: true, // Assuming generic sorting works on boolean
            render: (widgetType) => (widgetType.deprecated ? "Yes" : "No"),
        },
    ];

    const handleDownload = async (widgetType: WidgetType) => {
        try {
            const blob = await WidgetService.downloadWidgetType(widgetType.id.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${widgetType.alias}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Failed to download widget type", error);
            toast.error("Failed to download widget type");
        }
    };

    const rowActions = (widgetType: WidgetType) => (
        <div className="flex items-center gap-1">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(widgetType);
                }}
            >
                <Download className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(widgetType);
                }}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );

    const filterComponent = (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Deprecated</label>
            <Select
                value={deprecatedFilter}
                onValueChange={onDeprecatedFilterChange}
                options={[
                    { value: "ALL", label: "All" },
                    { value: "ACTUAL", label: "Actual" },
                    { value: "DEPRECATED", label: "Deprecated" },
                ]}
                placeholder="All"
                className="w-[180px]"
            />
        </div>
    );

    return (
        <DataTable
            title="Widget Types"
            data={widgetTypes}
            columns={columns}
            getRowId={(widgetType) => widgetType.id.id}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={onPageChange}
            sortProperty={sortProperty}
            sortOrder={sortOrder}
            onSortChange={onSortChange}
            onAdd={customAction ? undefined : onAdd}
            onRefresh={onRefresh}
            onRowClick={onRowClick}
            rowActions={rowActions}
            filterComponent={filterComponent}
            customAction={customAction}
            emptyMessage="No widget types found."
            loadingMessage="Loading widget types..."
        />
    );
};
