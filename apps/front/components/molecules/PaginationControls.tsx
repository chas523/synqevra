"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationControlsProps) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i);

  if (totalPages <= 1) return null;

  return (
    <div
      className={`flex items-center justify-between border-t border-border pt-4 ${className}`}
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>

      <div className="flex items-center gap-1">
        {pages.map((page) => (
          <button
            type="button"
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
              currentPage === page
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {page + 1}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default PaginationControls;
