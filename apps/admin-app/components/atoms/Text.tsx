import { cn } from "@/lib/utils";

interface TextProps {
  children: React.ReactNode;
  variant?: "body" | "caption" | "label" | "heading";
  weight?: "normal" | "medium" | "semibold";
  color?: "default" | "muted" | "error" | "success";
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  className?: string;
}

export const Text = ({
  children,
  variant = "body",
  weight = "normal",
  color = "default",
  size,
  className,
}: TextProps) => {
  const variantClasses = {
    body: "text-sm sm:text-base",
    caption: "text-xs sm:text-sm",
    label: "text-sm font-medium",
    heading: "text-lg sm:text-xl font-medium",
  };

  const weightClasses = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
  };

  const colorClasses = {
    default: "text-gray-900",
    muted: "text-gray-600",
    error: "text-red-600",
    success: "text-green-600",
  };

  const sizeClasses = size
    ? {
        xs: "text-xs",
        sm: "text-sm",
        base: "text-base",
        lg: "text-lg",
        xl: "text-xl",
      }[size]
    : undefined;

  return (
    <span
      className={cn(
        size ? sizeClasses : variantClasses[variant],
        weightClasses[weight],
        colorClasses[color],
        className,
      )}
    >
      {children}
    </span>
  );
};
