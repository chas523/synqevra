import Icon from "../atoms/Icon";

export interface StatusIconProps {
  status: "loading" | "success" | "error";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const StatusIcon = ({
  status,
  size = "lg",
  className = "",
}: StatusIconProps) => {
  const baseStyles = [
    "rounded-full",
    "flex",
    "items-center",
    "justify-center",
    "mx-auto",
    "mb-3",
  ];

  const sizeStyles = {
    sm: ["w-8", "h-8"],
    md: ["w-12", "h-12"],
    lg: ["w-16", "h-16"],
  };

  const statusStyles = {
    loading: ["bg-blue-500", "text-white"],
    success: ["bg-green-500", "text-white"],
    error: ["bg-red-500", "text-white"],
  };

  const iconNames = {
    loading: "loading" as const,
    success: "success" as const,
    error: "error" as const,
  };

  const allStyles = [
    ...baseStyles,
    ...sizeStyles[size],
    ...statusStyles[status],
    className,
  ];

  return (
    <div className={allStyles.join(" ")}>
      <Icon
        name={iconNames[status]}
        size={size === "lg" ? "lg" : "md"}
        strokeWidth={status === "success" ? 3 : 2}
      />
    </div>
  );
};

export default StatusIcon;
