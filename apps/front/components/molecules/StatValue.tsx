import { cn } from "@/lib/utils";

interface StatValueProps {
  value: string | number;
  label: string;
  className?: string;
}

export function StatValue({ value, label, className }: StatValueProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="text-3xl font-bold text-foreground">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
