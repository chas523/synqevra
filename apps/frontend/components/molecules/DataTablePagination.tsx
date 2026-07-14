"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export const DataTablePagination: React.FC<DataTablePaginationProps> = ({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  isLoading = false,
}) => {
  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  const canGoPrevious = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
      <div className="text-sm text-muted-foreground whitespace-nowrap text-center sm:text-left w-full sm:w-auto">
        {totalElements > 0 ? (
          <>
            Showing {startItem} to {endItem} of {totalElements} results
          </>
        ) : (
          "No results"
        )}
      </div>
      <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(0)}
          disabled={!canGoPrevious || isLoading}
          className="h-7 w-7 sm:h-8 sm:w-8 shrink-0"
        >
          <ChevronsLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious || isLoading}
          className="h-7 w-7 sm:h-8 sm:w-8 shrink-0"
        >
          <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
        <span className="text-[12px] sm:text-sm text-muted-foreground min-w-[80px] sm:min-w-[100px] text-center shrink-0">
          Page {currentPage + 1} of {Math.max(1, totalPages)}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext || isLoading}
          className="h-7 w-7 sm:h-8 sm:w-8 shrink-0"
        >
          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages - 1)}
          disabled={!canGoNext || isLoading}
          className="h-7 w-7 sm:h-8 sm:w-8 shrink-0"
        >
          <ChevronsRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>
  );
};
