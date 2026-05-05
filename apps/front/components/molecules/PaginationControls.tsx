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
      className={`flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/10 gap-2 ${className}`}
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all text-sm shrink-0"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      <div className="flex items-center gap-1 overflow-x-auto max-w-full no-scrollbar px-1">
        {pages.map((page) => (
          <button
            type="button"
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-sm font-medium transition-all shrink-0 ${currentPage === page
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
        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-all text-sm shrink-0"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default PaginationControls;
