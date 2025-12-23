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
      "border-gray-300",
      "dark:border-gray-600",
      "bg-white",
      "dark:bg-gray-800",
      "text-gray-900",
      "dark:text-gray-100",
      "focus:ring-blue-500",
      "focus:border-blue-500",
    ],
    error: [
      "border-red-300",
      "dark:border-red-600",
      "bg-white",
      "dark:bg-gray-800",
      "text-gray-900",
      "dark:text-gray-100",
      "focus:ring-red-500",
      "focus:border-red-500",
    ],
  };

  const allStyles = [...baseStyles, ...variantStyles[variant], className];

  return <input className={allStyles.join(" ")} {...props} />;
};

export default Input;
