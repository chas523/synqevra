"use client";

import { cn } from "@/lib/utils";
import { HelpCircle, Pencil, X } from "lucide-react";
import type { ReactNode } from "react";

export interface DetailPanelHeaderProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  onEdit?: () => void;
  onHelp?: () => void;
  actions?: ReactNode;
  className?: string;
}

export function DetailPanelHeader({
  title,
  subtitle,
  onClose,
  onEdit,
  onHelp,
  actions,
  className,
}: DetailPanelHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between p-4 border-b border-border dark:border-slate-700/50 bg-background dark:bg-slate-900/80",
        className,
      )}
    >
      <div className="flex-1 min-w-0 pr-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1">
        {actions}
        {onHelp && (
          <button
            type="button"
            onClick={onHelp}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Pomoc"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        )}
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="p-2 text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
            title="Edytuj"
          >
            <Pencil className="w-5 h-5" />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
