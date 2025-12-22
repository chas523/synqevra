export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  variant?: "default" | "error";
}

const Label = ({
  className = "",
  required = false,
  variant = "default",
  children,
  ...props
}: LabelProps) => {
  const baseStyles = ["block", "text-sm", "font-medium", "mb-1"];

  const variantStyles = {
    default: ["text-gray-700", "dark:text-gray-300"],
    error: ["text-red-700", "dark:text-red-300"],
  };

  const allStyles = [...baseStyles, ...variantStyles[variant], className];

  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: <it's atomic component, it's connected to input in molecule component>
    <label className={allStyles.join(" ")} {...props}>
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

export default Label;
