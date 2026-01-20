import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemMetricCardProps {
  label: string;
  value: string;
  subtitle: string;
  checked?: boolean;
  className?: string;
}

export function SystemMetricCard({
  label,
  value,
  subtitle,
  checked,
  className,
}: SystemMetricCardProps) {
  return (
    <div
      className={cn(
        "relative min-h-0 gap-0  justify-between flex flex-col overflow-hidden",
        className
      )}
    >
      <CardHeader className="gap-0  min-w-0 flex-none">
        <div className="flex items-center gap-1 min-w-0">
          <span className="text-[10px] lg:text-xs text-muted-foreground truncate min-w-0">
            {label}
          </span>
          {checked && (
            <Check className="h-3 w-3 text-green-600 flex-shrink-0" />
          )}
        </div>
      </CardHeader>
      <CardContent className=" flex-1 flex items-end">
        <div className="text-sm lg:text-base font-bold truncate" title={value}>
          {value}
        </div>
        <div className="ml-1 text-[9px] text-muted-foreground whitespace-nowrap">
          {subtitle}
        </div>
      </CardContent>
    </div>
  );
}
