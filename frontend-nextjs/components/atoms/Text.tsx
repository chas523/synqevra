export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: "xs" | "sm" | "md" | "lg";
  color?: "default" | "muted" | "error" | "success";
  weight?: "normal" | "medium" | "semibold" | "bold";
  align?: "left" | "center" | "right";
}

const Text = ({
  size = "md",
  color = "default",
  weight = "normal",
  align = "left",
  className = "",
  children,
  ...props
}: TextProps) => {
  const baseStyles: string[] = [];

  const sizeStyles = {
    xs: ["text-xs"],
    sm: ["text-sm"],
    md: ["text-sm", "md:text-base"],
    lg: ["text-base", "md:text-lg"],
  };

  const colorStyles = {
    default: ["text-gray-900", "dark:text-white"],
    muted: ["text-gray-600", "dark:text-gray-300"],
    error: ["text-red-600", "dark:text-red-400"],
    success: ["text-green-600", "dark:text-green-400"],
  };

  const weightStyles = {
    normal: ["font-normal"],
    medium: ["font-medium"],
    semibold: ["font-semibold"],
    bold: ["font-bold"],
  };

  const alignStyles = {
    left: ["text-left"],
    center: ["text-center"],
    right: ["text-right"],
  };

  const allStyles = [
    ...baseStyles,
    ...sizeStyles[size],
    ...colorStyles[color],
    ...weightStyles[weight],
    ...alignStyles[align],
    className,
  ];

  return (
    <p className={allStyles.join(" ")} {...props}>
      {children}
    </p>
  );
};

export default Text;
