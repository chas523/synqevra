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
    primary: "text-white bg-black hover:bg-gray-800 focus:ring-gray-900",
    secondary:
      "text-gray-900 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500",
    outline:
      "text-gray-900 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-gray-500",
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
