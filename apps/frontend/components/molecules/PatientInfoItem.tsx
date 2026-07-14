import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type PatientInfoItemVariant = "compact" | "default" | "detailed";

interface PatientInfoItemProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  variant?: PatientInfoItemVariant;
}

const variantStyles = {
  compact: {
    container: "text-[10px] py-1",
    label: "text-[10px]",
    value: "text-[10px]",
  },
  default: {
    container: "text-xs py-1.5",
    label: "text-xs",
    value: "text-xs",
  },
  detailed: {
    container: "text-sm py-2",
    label: "text-sm",
    value: "text-sm",
  },
} as const;

export function PatientInfoItem({
  label,
  value,
  icon: Icon,
  variant = "compact",
}: PatientInfoItemProps) {
  const styles = variantStyles[variant];

  return (
    <div className={cn("flex items-center justify-between", styles.container)}>
      <span
        className={cn(
          "text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1",
          styles.label,
        )}
      >
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </span>
      <span
        className={cn(
          "text-slate-900 dark:text-white font-semibold",
          styles.value,
        )}
      >
        {value}
      </span>
    </div>
  );
}
