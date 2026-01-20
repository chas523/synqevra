import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import {
  Card,
  CardHeader,
  CardContent,
} from "../../../admin-app/components/ui/card";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  addButton?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  subtitle,
  addButton,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative min-h-0 gap-0 justify-between overflow-hidden flex flex-col",
        className
      )}
    >
      <CardHeader className="gap-0 px-2 py-0.5 flex-none">
        <div className="flex items-center justify-between">
          <span className="text-[10px] lg:text-xs text-muted-foreground truncate">
            {label}
          </span>
          {addButton && (
            <Plus className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground flex-shrink-0" />
          )}
        </div>
      </CardHeader>
      <CardContent className="px-2 py-0.5 flex-1 flex items-end">
        <div className="text-sm lg:text-base font-bold">{value}</div>
        {subtitle && (
          <div className="ml-1 text-[9px] text-muted-foreground">
            {subtitle}
          </div>
        )}
      </CardContent>
    </div>
  );
}
