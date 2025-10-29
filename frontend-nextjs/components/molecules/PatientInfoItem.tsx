import type { LucideIcon } from "lucide-react";

interface PatientInfoItemProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
}

export function PatientInfoItem({
  label,
  value,
  icon: Icon,
}: PatientInfoItemProps) {
  return (
    <div className="flex items-center justify-between text-[10px] py-1">
      <span className="text-slate-600 font-medium flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </span>
      <span className="text-slate-900 font-semibold text-[10px]">{value}</span>
    </div>
  );
}
