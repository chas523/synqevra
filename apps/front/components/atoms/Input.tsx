export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "error";
}

const Input = ({
  className = "",
  variant = "default",
  ...props
}: InputProps) => {
  const baseStyles = [
    "w-full",
    "px-3",
    "py-2",
    "text-sm",
    "border",
    "rounded-md",
    "transition-colors",
    "focus:outline-none",
    "focus:ring-2",
    "focus:ring-offset-2",
  ];

  const variantStyles = {
    default: [
      "border-border",
      "bg-background",
      "text-foreground",
      "focus:ring-ring",
      "focus:border-ring",
      "dark:border-gray-600",
      "dark:bg-gray-800",
      "dark:text-gray-100",
    ],
    error: [
      "border-destructive",
      "bg-background",
      "text-foreground",
      "focus:ring-destructive",
      "focus:border-destructive",
      "dark:border-red-600",
      "dark:bg-gray-800",
      "dark:text-gray-100",
    ],
  };

  const allStyles = [...baseStyles, ...variantStyles[variant], className];

  return <input className={allStyles.join(" ")} {...props} />;
};

export default Input;
