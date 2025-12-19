import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  message: string;
  variant?: "inline" | "block";
  className?: string;
}

export const ErrorMessage = ({
  message,
  variant = "inline",
  className,
}: ErrorMessageProps) => {
  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2 text-red-600", className)}>
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">{message}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700",
        className,
      )}
    >
      <AlertCircle className="h-4 w-4" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};
