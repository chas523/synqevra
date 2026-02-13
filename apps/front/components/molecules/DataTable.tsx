"use client";

import { ReactNode, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTablePagination } from "./DataTablePagination";
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Plus,
    RefreshCw,
    Search,
} from "lucide-react";

export interface DataTableColumn<T> {
    key: string;
    header: string;
    sortable?: boolean;
    className?: string;
    render?: (item: T) => ReactNode;
}

export interface DataTableProps<T> {
    title: string;
    data: T[];
    columns: DataTableColumn<T>[];
    getRowId: (item: T) => string;
    isLoading: boolean;
    // Pagination
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    // Sorting
    sortProperty?: string;
    sortOrder?: "ASC" | "DESC";
    onSortChange?: (property: string, order: "ASC" | "DESC") => void;
    // Actions
    onAdd?: () => void;
    onRefresh?: () => void;
    onRowClick?: (item: T) => void;
    rowActions?: (item: T) => ReactNode;
    // Optional filter component
    filterComponent?: ReactNode;
    // Empty state message
    emptyMessage?: string;
    loadingMessage?: string;
    addButtonLabel?: string;
    customAction?: ReactNode;
}

export function DataTable<T>({
    title,
    data,
    columns,
    getRowId,
    isLoading,
    currentPage,
    totalPages,
    totalElements,
    pageSize,
    onPageChange,
    sortProperty,
    sortOrder = "DESC",
    onSortChange,
    onAdd,
    onRefresh,
    onRowClick,
    rowActions,
    filterComponent,
    emptyMessage = "No data found.",
    loadingMessage = "Loading...",
    addButtonLabel,
    customAction,
}: DataTableProps<T>) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(data.map((item) => getRowId(item)));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds([...selectedIds, id]);
        } else {
            setSelectedIds(selectedIds.filter((sid) => sid !== id));
        }
    };

    const handleSort = (columnKey: string) => {
        if (!onSortChange) return;

        if (sortProperty === columnKey) {
            // Toggle order
            onSortChange(columnKey, sortOrder === "ASC" ? "DESC" : "ASC");
        } else {
            // New column, default to ASC
            onSortChange(columnKey, "ASC");
        }
    };

    const getSortIcon = (columnKey: string) => {
        if (sortProperty !== columnKey) {
            return <ArrowUpDown className="h-4 w-4 ml-1 text-muted-foreground" />;
        }
        return sortOrder === "ASC" ? (
            <ArrowUp className="h-4 w-4 ml-1" />
        ) : (
            <ArrowDown className="h-4 w-4 ml-1" />
        );
    };

    const getCellValue = (item: T, column: DataTableColumn<T>): ReactNode => {
        if (column.render) {
            return column.render(item);
        }
        const value = (item as Record<string, unknown>)[column.key];
        return value !== undefined && value !== null ? String(value) : "-";
    };

    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="flex items-center gap-4">
                    <CardTitle className="text-xl font-bold">{title}</CardTitle>
                    {filterComponent}
                </div>
                <div className="flex items-center space-x-2">
                    {customAction}
                    {onAdd && (
                        <Button variant="ghost" size="sm" onClick={onAdd} className="border rounded-lg">
                            <Plus className="h-4 w-4 mr-2" />
                            {addButtonLabel || "Add"}
                        </Button>
                    )}
                    {onRefresh && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onRefresh}
                            disabled={isLoading}
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                            />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <Checkbox
                                        checked={
                                            data.length > 0 && selectedIds.length === data.length
                                        }
                                        onCheckedChange={(checked) =>
                                            handleSelectAll(checked as boolean)
                                        }
                                    />
                                </TableHead>
                                {columns.map((column) => (
                                    <TableHead
                                        key={column.key}
                                        className={column.className}
                                    >
                                        {column.sortable && onSortChange ? (
                                            <button
                                                type="button"
                                                onClick={() => handleSort(column.key)}
                                                className="flex items-center hover:text-foreground transition-colors"
                                            >
                                                {column.header}
                                                {getSortIcon(column.key)}
                                            </button>
                                        ) : (
                                            column.header
                                        )}
                                    </TableHead>
                                ))}
                                {rowActions && <TableHead className="w-[100px]"></TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length + (rowActions ? 2 : 1)}
                                        className="h-24 text-center"
                                    >
                                        {loadingMessage}
                                    </TableCell>
                                </TableRow>
                            ) : data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length + (rowActions ? 2 : 1)}
                                        className="h-24 text-center"
                                    >
                                        {emptyMessage}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((item) => {
                                    const id = getRowId(item);
                                    return (
                                        <TableRow
                                            key={id}
                                            className={
                                                onRowClick
                                                    ? "cursor-pointer hover:bg-muted/50"
                                                    : ""
                                            }
                                            onClick={() => onRowClick?.(item)}
                                        >
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedIds.includes(id)}
                                                    onCheckedChange={(checked) =>
                                                        handleSelectOne(id, checked as boolean)
                                                    }
                                                />
                                            </TableCell>
                                            {columns.map((column) => (
                                                <TableCell
                                                    key={column.key}
                                                    className={column.className}
                                                >
                                                    {getCellValue(item, column)}
                                                </TableCell>
                                            ))}
                                            {rowActions && (
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    {rowActions(item)}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
                <DataTablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    pageSize={pageSize}
                    onPageChange={onPageChange}
                    isLoading={isLoading}
                />
            </CardContent>
        </Card>
    );
}
