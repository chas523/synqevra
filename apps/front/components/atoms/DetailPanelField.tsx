"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface DetailPanelFieldProps {
  label: string;
  value?: string | ReactNode;
  className?: string;
  isLink?: boolean;
  href?: string;
  isEmpty?: boolean;
}

export function DetailPanelField({
  label,
  value,
  className,
  isLink = false,
  href,
  isEmpty = false,
}: DetailPanelFieldProps) {
  const displayValue =
    isEmpty || !value ? (
      <span className="text-slate-400 dark:text-slate-500 italic">—</span>
    ) : isLink && href ? (
      <a
        href={href}
        className="text-cyan-600 dark:text-cyan-400 hover:underline transition-colors"
      >
        {value}
      </a>
    ) : (
      <span className="text-slate-900 dark:text-white">{value}</span>
    );

  return (
    <div className={cn("space-y-1", className)}>
      <label className="block text-xs text-slate-500 dark:text-slate-400 font-medium">
        {label}
      </label>
      <div className="text-sm">{displayValue}</div>
    </div>
  );
}
