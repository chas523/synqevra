import { cn } from "@/lib/utils";

interface SpacerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  direction?: "vertical" | "horizontal";
  className?: string;
}

export const Spacer = ({
  size = "md",
  direction = "vertical",
  className,
}: SpacerProps) => {
  const sizeClasses = {
    xs: direction === "vertical" ? "h-2" : "w-2",
    sm: direction === "vertical" ? "h-3" : "w-3",
    md: direction === "vertical" ? "h-4" : "w-4",
    lg: direction === "vertical" ? "h-6" : "w-6",
    xl: direction === "vertical" ? "h-8" : "w-8",
  };

  return <div className={cn(sizeClasses[size], className)} />;
};
