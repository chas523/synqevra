import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PatientDetailSectionProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function PatientDetailSection({
  title,
  icon,
  children,
  isEmpty = false,
  emptyMessage = "No information available",
  className,
}: PatientDetailSectionProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-xl p-4 shadow-sm dark:shadow-xl",
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
        {icon && <div className="text-cyan-500 dark:text-cyan-400">{icon}</div>}
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          {title}
        </h2>
      </div>
      {isEmpty ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 italic py-2">
          {emptyMessage}
        </p>
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </div>
  );
}
