export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: "sm" | "md" | "lg" | "xl";
  color?: "default" | "muted";
}

const Heading = ({
  level = 1,
  size = "md",
  color = "default",
  className = "",
  children,
  ...props
}: HeadingProps) => {
  const baseStyles = ["font-bold"];

  const sizeStyles = {
    sm: ["text-lg"],
    md: ["text-xl"],
    lg: ["text-3xl", "md:text-4xl"],
    xl: ["text-4xl", "md:text-5xl"],
  };

  const colorStyles = {
    default: ["text-gray-900", "dark:text-white"],
    muted: ["text-gray-600", "dark:text-gray-300"],
  };

  const allStyles = [
    ...baseStyles,
    ...sizeStyles[size],
    ...colorStyles[color],
    className,
  ];

  const headingClass = allStyles.join(" ");

  if (level === 1)
    return (
      <h1 className={headingClass} {...props}>
        {children}
      </h1>
    );
  if (level === 2)
    return (
      <h2 className={headingClass} {...props}>
        {children}
      </h2>
    );
  if (level === 3)
    return (
      <h3 className={headingClass} {...props}>
        {children}
      </h3>
    );
  if (level === 4)
    return (
      <h4 className={headingClass} {...props}>
        {children}
      </h4>
    );
  if (level === 5)
    return (
      <h5 className={headingClass} {...props}>
        {children}
      </h5>
    );
  return (
    <h6 className={headingClass} {...props}>
      {children}
    </h6>
  );
};

export default Heading;
