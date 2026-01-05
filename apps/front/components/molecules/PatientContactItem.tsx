import type { LucideIcon } from "lucide-react";

interface PatientContactItemProps {
  icon: LucideIcon;
  label: string;
  value: string;
  iconBgColor: string;
  iconColor: string;
  variant?: "compact" | "default" | "detailed";
}

const variantStyles = {
  compact: {
    label: "text-[10px]",
    value: "text-xs",
  },
  default: {
    label: "text-xs",
    value: "text-sm",
  },
  detailed: {
    label: "text-sm",
    value: "text-base",
  },
} as const;

export function PatientContactItem({
  icon: Icon,
  label,
  value,
  iconBgColor,
  iconColor,
  variant = "compact",
}: PatientContactItemProps) {
  const variantStyle = variantStyles[variant];
  return (
    <div className="flex items-center gap-2 rounded-lg bg-white/5 p-2 transition-colors hover:bg-white/10 border border-white/10">
      <div
        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${iconBgColor}`}
      >
        <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-slate-400 leading-tight ${variantStyle.label}`}>
          {label}
        </div>
        <div
          className={`font-semibold text-white truncate ${variantStyle.value}`}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
