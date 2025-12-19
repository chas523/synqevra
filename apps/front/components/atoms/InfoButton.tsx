export interface InfoButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary";
  size?: "sm" | "md";
}

const InfoButton = ({
  variant = "default",
  size = "sm",
  className = "",
  children = "i",
  ...props
}: InfoButtonProps) => {
  const baseStyles = [
    "flex",
    "items-center",
    "justify-center",
    "rounded-full",
    "text-xs",
    "font-bold",
    "border",
    "cursor-pointer",
    "focus:outline-none",
  ];

  const sizeStyles = {
    sm: ["w-5", "h-5"],
    md: ["w-6", "h-6"],
  };

  const variantStyles = {
    default: [
      "bg-blue-100",
      "dark:bg-blue-900",
      "text-blue-700",
      "dark:text-blue-300",
      "border-blue-200",
      "dark:border-blue-800",
    ],
    primary: [
      "bg-blue-600",
      "dark:bg-blue-500",
      "text-white",
      "border-blue-600",
      "dark:border-blue-500",
    ],
  };

  const allStyles = [
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    className,
  ];

  return (
    <button type="button" className={allStyles.join(" ")} {...props}>
      {children}
    </button>
  );
};

export default InfoButton;
