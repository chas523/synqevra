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
import { cn } from "@/lib/utils";
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
  tableClassName?: string;
  hideCard?: boolean;
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
  tableClassName,
  hideCard,
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

  const tableContent = (
    <>
      <div className="rounded-md border overflow-x-auto">
        <Table className={cn("min-w-max", tableClassName)}>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12.5">
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
                <TableHead key={column.key} className={column.className}>
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
              {rowActions && <TableHead className="w-25"></TableHead>}
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
                      onRowClick ? "cursor-pointer hover:bg-muted/50" : ""
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
    </>
  );

  if (hideCard) {
    return (
      <div className="w-full space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4">
            <h3 className="text-xl font-bold">{title}</h3>
            {filterComponent}
          </div>
          <div className="flex shrink-0 items-center space-x-2 self-end sm:self-auto">
            {customAction}
            {onAdd && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onAdd}
                className="border rounded-lg"
              >
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
        </div>
        <div>{tableContent}</div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4">
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
          {filterComponent}
        </div>
        <div className="flex shrink-0 items-center space-x-2 self-end sm:self-auto">
          {customAction}
          {onAdd && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAdd}
              className="border rounded-lg"
            >
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
       {tableContent}
      </CardContent>
    </Card>
  );
}
