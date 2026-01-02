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
      className={`flex items-center justify-between pt-4 border-t border-white/10 ${className}`}
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-all text-sm"
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
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
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
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-all text-sm"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default PaginationControls;
