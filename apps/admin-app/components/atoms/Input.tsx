interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  error?: string;
  variant?: "default" | "error";
  fullWidth?: boolean;
}

export const Input = ({
  name,
  label,
  error,
  variant = "default",
  fullWidth = true,
  className = "",
  ...props
}: InputProps) => {
  const baseClasses =
    "appearance-none relative block px-4 py-3 border placeholder-gray-500 text-gray-900 rounded-md focus:outline-none text-sm transition-colors duration-200";
  const variantClasses = {
    default:
      "border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent",
    error:
      "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-transparent",
  };
  const widthClasses = fullWidth ? "w-full" : "";

  const inputClasses = `${baseClasses} ${variantClasses[variant]} ${widthClasses} ${className}`;

  return (
    <div className={fullWidth ? "w-full" : ""}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        className={inputClasses}
        aria-invalid={variant === "error"}
        aria-describedby={error ? `${name}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};
