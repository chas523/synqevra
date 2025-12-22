import { cn } from "@/lib/utils";

interface IconProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Icon = ({ children, size = "md", className }: IconProps) => {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <span className={cn(sizeClasses[size], "text-gray-500", className)}>
      {children}
    </span>
  );
};
