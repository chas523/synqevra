import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export const ButtonAtom = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "text-primary-foreground bg-primary hover:bg-primary/90 focus:ring-ring",
    secondary:
      "text-foreground bg-secondary hover:bg-secondary/80 focus:ring-ring dark:hover:bg-secondary/70",
    outline:
      "text-foreground bg-background border border-border hover:bg-muted focus:ring-ring",
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-sm",
    lg: "px-6 py-4 text-base",
  };

  const widthClasses = fullWidth ? "w-full" : "";

  const buttonClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClasses,
    className,
  );

  return (
    <button className={buttonClasses} disabled={disabled || loading} {...props}>
      {children}
    </button>
  );
};
