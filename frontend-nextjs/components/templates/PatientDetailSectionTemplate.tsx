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
        "rounded-lg border border-slate-200 bg-white p-4 shadow-sm",
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
        {icon && <div className="text-cyan-600">{icon}</div>}
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      </div>
      {isEmpty ? (
        <p className="text-sm text-slate-500 italic py-2">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </div>
  );
}
